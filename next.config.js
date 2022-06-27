module.exports = {
	reactStrictMode: true,
	experimental: {
		images: {
			layoutRaw: true,
		},
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ["style-loader", "postcss-loader"],
			},
			{
				test: /\.jsx?$/,
				use: ["babel-loader", "astroturf/loader"],
			},
		],
	},
};
