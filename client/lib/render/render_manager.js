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