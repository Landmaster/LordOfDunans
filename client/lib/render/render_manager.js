const BABYLON = require('babylonjs');
const Promise = require('bluebird');

/**
 * @param {BABYLON.Scene} templateScene
 * @author Landmaster
 * @constructor
 */
function RenderManager(templateScene) {
	this.templateScene = templateScene;
	
	this.loadingMeshes = new Map();
	
	this.idToImported = new Map();
}

/**
 * Loads a model.
 * @param identifier the model identifier
 * @param root the directory of the model file
 * @param modelFile the model file
 * @returns {bluebird|Promise} the model promise, which holds an invisible mesh for one to clone
 */
RenderManager.prototype.loadModel = function (identifier, root, modelFile) {
	if (!this.idToImported.has(identifier)) {
		let promise = new Promise((res, rej) => {
			BABYLON.SceneLoader.ImportMesh(identifier, root, modelFile, this.templateScene, (...imported) => {
				let mesh = imported[0][0];
				this.idToImported.set(mesh.name, imported);
				mesh.isVisible = false;
				this.loadingMeshes.delete(identifier);
				res(imported);
			}, undefined, rej);
		});
		this.loadingMeshes.set(identifier, promise);
		return promise;
	} else {
		return Promise.resolve(this.idToImported.get(identifier));
	}
};

module.exports = RenderManager;