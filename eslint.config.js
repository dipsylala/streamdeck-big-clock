import { config } from "@elgato/eslint-config";

export default [
	{
		ignores: [
			"com.github.dipsylala.big-clock.sdPlugin/**/*",
			"dist/**/*",
			"node_modules/**/*"
		]
	},
	...config.recommended.map(cfg => ({
		...cfg,
		files: ["src/**/*.ts"]
	}))
];