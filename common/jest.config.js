module.exports = {
	verbose: true,
	globals: {
		'ts-jest': {
			tsConfigFile: 'tsconfig.test.json'
		}
	},
	moduleFileExtensions: [
		'ts',
		'js'
	],
	transform: {
		'^.+\\.(ts|tsx)$': './node_modules/ts-jest/preprocessor.js'
	},
	testMatch: [
		'**/test/**/*.test.(ts|js)',
		'**/src/**/*.spec.(ts|js)'
	],
	testEnvironment: 'node'
};
