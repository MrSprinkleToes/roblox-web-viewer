/**
 * Provides functions for fetching assets from Roblox's asset delivery service.
 */

import { TextureLoader } from "./three.js-r137/build/three.module.js";
import { DDSLoader } from "./three.js-r137/examples/jsm/loaders/DDSLoader.js";

const PROXY = "http://localhost:8081"; // The proxy is used to circumvent CORS restrictions.
var ddsLoader = new DDSLoader();

var meshCache = {};
/**
 * Gets a mesh from Roblox's asset delivery service.
 * @param {number} id Roblox asset ID of the mesh
 * @returns 
 */
async function getMesh(id) {
	if (meshCache[id]) return meshCache[id];
	var d = await fetch(`${PROXY}/https://assetdelivery.roblox.com/v1/asset/?id=${id}`);
	var data = await d.arrayBuffer();
	meshCache[id] = data;
	return data;
}

var textureCache = {};
/**
 * Gets a texture (Image) from Roblox's asset delivery service.
 * @param {number} id Roblox asset ID of the texture (Image)
 * @returns 
 */
function getTexture(id) {
	if (id == undefined) return;
	if (textureCache[id]) {
		return textureCache[id];
	} else {
		var texture = new TextureLoader().load(`${PROXY}/https://assetdelivery.roblox.com/v1/asset/?id=${id}`);
		textureCache[id] = texture;
		return texture;
	}
}

/**
 * Gets a material image from ./textures/materials/
 * @param {string} mat Material name
 * @returns 
 * 
 * @deprecated Not functional yet
 * @todo Implement materials in the renderer
 */
function getMaterial(mat) {
	if (textureCache[mat]) return textureCache[mat];
	var texture = ddsLoader.load(`./textures/materials/${mat}.dds`);
	return texture;
}

export { getMesh, getTexture, getMaterial };