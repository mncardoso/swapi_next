import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";

let ageCalc = (born, movie) => {
	let currentDate =
		movie === 0
			? [32, "BBY"] // I => The Phantom Menace
			: movie === 1
			? [22, "BBY"] // II => Attack of the Clones
			: movie === 2
			? [19, "BBY"] // II => Revenge of the Sith
			: movie === 3
			? [0, "ABY"] // IV => A New Hope
			: movie === 4
			? [3, "ABY"] // V => The Empire Strikes Back
			: movie === 5
			? [4, "ABY"] // VI => Return of the Jedi
			: movie === 6
			? [34, "ABY"] // VII => The Force Awakens
			: movie === 7
			? [34, "ABY"] // VIII => The Last Jedi
			: movie === 8
			? [35, "ABY"] // IX => The Rise of Skywalker
			: null;
	if (born !== "unknown") {
		let inputDate = [
			parseFloat(born.slice(0, -3)),
			born.slice(-3, born.length),
		];
		let age;
		if (currentDate[1] === "BBY") {
			age = (inputDate[0] - currentDate[0]).toFixed(0);
		} else if (currentDate[1] === "ABY") {
			if (inputDate[1] === "BBY") {
				age = (inputDate[0] + currentDate[0] + 1).toFixed(0);
			} else {
				age = (currentDate[0] - inputDate[0]).toFixed(0);
			}
		}
		return parseFloat(age);
	} else {
		return null;
	}
};

export const getStaticProps = async () => {
	const data = await fetch("https://swapi.dev/api/films/")
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			return data["results"];
		})
		.then((list) => {
			list.sort(function (a, b) {
				return a["episode_id"] - b["episode_id"];
			});
			return list;
		});

	return {
		props: {
			data,
		},
	};
};

let sorter = (descending, type) => {
	return (a, b) => {
		if (a[type] === b[type]) {
			return 0;
		} else if (a[type] === null) {
			return 1;
		} else if (b[type] === null) {
			return -1;
		} else if (descending) {
			return a[type] < b[type] ? -1 : 1;
		} else {
			return a[type] < b[type] ? 1 : -1;
		}
	};
};

let Home = ({ data }) => {
	let router = useRouter();

	let [movie, setMovie] = useState(0);
	let [loading, setLoading] = useState(true);
	let [characters, setCharacters] = useState(null);
	let [page, setPage] = useState(0);

	// sorting states
	let [descending, setDescending] = useState(true);
	let [sorting, setSorting] = useState("age");
	let [gender, setGender] = useState(null);

	useEffect(() => {
		let id =
			router.query.episode_id !== undefined
				? parseInt(router.query.episode_id)
				: 0;
		setMovie(id);
	}, [router.query.episode_id]);

	useEffect(() => {
		let page =
			router.query.page !== undefined ? parseInt(router.query.page) : 0;
		setPage(page);
	}, [router.query.page]);

	useEffect(() => {
		let state =
			router.query.descending !== undefined
				? router.query.descending === "true"
				: true;
		setDescending(state);
	}, [router.query.descending]);

	useEffect(() => {
		let state =
			router.query.sorting !== undefined ? router.query.sorting : "age";
		setSorting(state);
	}, [router.query.sorting]);

	useEffect(() => {
		let state = router.query.gender ? router.query.gender : null;
		setGender(state);
	}, [router.query.gender]);

	useEffect(() => {
		if (movie !== undefined) {
			setLoading(true);
			let list = data[movie]["characters"];
			let characterList = [];
			Promise.all(
				list.map((char) =>
					fetch(char)
						.then((res) => res.json())
						.then((data) => {
							let gender;
							if (data.gender === "hermaphrodite") {
								gender = "???";
							} else if (data.gender === "male") {
								gender = "???";
							} else if (data.gender === "female") {
								gender = "???";
							} else {
								gender = "????";
							}
							let character = {
								id: parseInt(data.url.split("/").slice(-2)),
								name: data.name,
								gender: gender,
								height: parseInt(data.height),
								age: ageCalc(data.birth_year, movie),
							};
							characterList.push(character);
						})
						.catch((e) => console.error(e))
				)
			)
				.then(() => {
					gender !== null
						? characterList.map((char) => {
								char.gender !== gender ? characterList.pop(char) : null;
						  })
						: null;
				})
				.then(() => {
					characterList.sort(sorter(descending, sorting));
					return characterList;
				})
				.then((list) => {
					// alert(list);
					setCharacters(list);
					setLoading(false);
				});
		}
	}, [movie, page, descending, sorting, gender]);

	return (
		<div className={styles.container}>
			<Head>
				<title>{`SW`}</title>
				<meta name="description" content="Generated by create next app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<menu className={styles.menu}>
				<ul>
					{data.map((movie) => (
						<li className={styles.Movie} key={movie.title}>
							<Link
								href={{
									query: {
										...router.query,
										page: 0,
										episode_id: movie.episode_id - 1,
									},
								}}
								passHref
								scroll={false}
								replace
								style={styles.link}
							>
								<a>
									<Image
										src={`/img/films/${movie.episode_id}.jpg`}
										alt={movie.title}
										width={200}
										height={275}
										layout="raw"
									/>
									{movie.title}
								</a>
							</Link>
						</li>
					))}
				</ul>
			</menu>
			<filter className={styles.filter}>
				<Link
					href={{
						query: {
							...router.query,
							page: 0,
							descending: !(router.query.descending === "true"),
						},
					}}
					passHref
					scroll={false}
					replace
					style={styles.link}
				>
					<a>{descending ? "????" : "????"}</a>
				</Link>
				<Link
					href={{
						query: {
							...router.query,
							page: 0,
							sorting: router.query.sorting === "age" ? "height" : "age",
						},
					}}
					passHref
					scroll={false}
					replace
					style={styles.link}
				>
					<a>{sorting}</a>
				</Link>
				<p>{gender === null ? "All" : gender}</p>
				<Link
					href={{
						query: {
							...router.query,
							page: 0,
							gender: null,
						},
					}}
					passHref
					scroll={false}
					replace
					style={styles.link}
				>
					<a>all</a>
				</Link>
				<Link
					href={{
						query: {
							...router.query,
							page: 0,
							gender: "???",
						},
					}}
					passHref
					scroll={false}
					replace
					style={styles.link}
				>
					<a>???</a>
				</Link>
				<Link
					href={{
						query: {
							...router.query,
							page: 0,
							gender: "???",
						},
					}}
					passHref
					scroll={false}
					replace
					style={styles.link}
				>
					<a>???</a>
				</Link>
			</filter>
			<main className={styles.main}>
				{!loading ? (
					<>
						<h1>{data[movie].title}</h1>
						<div className={styles.characterList}>
							{characters
								.slice(
									30 * page,
									characters.length <= 30 * page + 30
										? characters.length
										: 30 * page + 30
								)
								.map((d) => {
									if (d["gender"] === gender || gender === null) {
										return (
											<div className={styles.character} key={d.title}>
												<Image
													src={`/img/people/${d.id}.jpg`}
													alt={d.title}
													width={100}
													height={137.5}
													layout="raw"
												/>
												<div className={styles.stats}>
													<h3>name:</h3>
													<p>{`${d["gender"]} ${d["name"]}`}</p>
													<h3>height:</h3>
													<p>{`${d["height"]}m`}</p>
													<h3>age:</h3>
													<p>{d["age"] === null ? "???" : d["age"]}</p>
												</div>
											</div>
										);
									}
								})}
						</div>
					</>
				) : (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="200px"
						height="200px"
						viewBox="0 0 100 100"
						preserveAspectRatio="xMidYMid"
					>
						<circle
							cx="50"
							cy="50"
							r="24"
							strokeWidth="6"
							stroke="#93dbe9"
							strokeDasharray="37.69911184307752 37.69911184307752"
							fill="none"
							strokeLinecap="round"
							className={styles.loadingOut}
						>
							<animateTransform
								attributeName="transform"
								type="rotate"
								dur="2s"
								repeatCount="indefinite"
								keyTimes="0;1"
								values="0 50 50;360 50 50"
							></animateTransform>
						</circle>
						<circle
							cx="50"
							cy="50"
							r="17"
							strokeWidth="6"
							stroke="#689cc5"
							strokeDasharray="26.703537555513243 26.703537555513243"
							strokeDashoffset="26.703537555513243"
							fill="none"
							strokeLinecap="round"
							className={styles.loadingIn}
						>
							<animateTransform
								attributeName="transform"
								type="rotate"
								dur="2s"
								repeatCount="indefinite"
								keyTimes="0;1"
								values="0 50 50;-360 50 50"
							></animateTransform>
						</circle>
					</svg>
				)}
				{!loading ? (
					characters.length > 30 ? (
						<div className={styles.arrows}>
							{router.query.page != 0 ? (
								<Link
									href={{
										query: { ...router.query, page: page - 1 },
									}}
									passHref
									scroll={true}
									replace
								>
									<a>{"????"}</a>
								</Link>
							) : (
								<p>{"????"}</p>
							)}
							<h2>{page}</h2>
							{characters.length > 30 * parseInt(router.query.page) + 30 ? (
								<Link
									href={{
										query: { ...router.query, page: page + 1 },
									}}
									passHref
									scroll={true}
									replace
								>
									<a>{"????"}</a>
								</Link>
							) : (
								<p>{"????"}</p>
							)}
						</div>
					) : (
						<></>
					)
				) : (
					<></>
				)}
			</main>
		</div>
	);
};

export default Home;
