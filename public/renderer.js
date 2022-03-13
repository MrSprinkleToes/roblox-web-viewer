import * as THREE from "./three.js-r137/build/three.module.js"
import FlyCamera from "./camera.js";
import { getMaterial, getTexture } from "./assetdelivery.js";

// Set up renderer & scene
var canvas = document.querySelector("#canvas");
var renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
var cam = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	2000
);
var scene = new THREE.Scene();
var controls = new FlyCamera(cam, canvas);
var clock = new THREE.Clock();
var dt = 0;
cam.position.set(0, 20, 20);

// Lighting
var sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(0, 10, 1);
scene.add(sun);
var ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

// Geometries
var geometries = {
	Block: await import("./rendering/primitive/block.js"),
	Cylinder: await import("./rendering/primitive/cylinder.js"),
	Ball: await import("./rendering/primitive/sphere.js"),
	Mesh: await import("./rendering/mesh.js"),
};

/**
 * Renders a frame
 * @param {*} ts timestamp
 */
function render(ts) {
	dt = clock.getDelta();
	controls.update(dt);
	renderer.render(scene, cam);
	requestAnimationFrame(render);
}
requestAnimationFrame(render);

/**
 * Loops through the queued frames and renders them at 60fps
 */
var objs = {};
var queued_frames = [];
setInterval(async () => {
	if (queued_frames.length > 0) {
		let frame = queued_frames.shift();
		for (let i = 0; i < frame.length; i++) {
			let inst = frame[i];
			if (inst.id in objs) {
				let obj = objs[inst.id];
				obj.position.set(inst.position[0], inst.position[1], inst.position[2]);
				obj.rotation.set(inst.rotation[0], inst.rotation[1], inst.rotation[2]);
				if (inst.shape == "Cylinder") {
					obj.rotation.z += Math.PI / 2;
				}
				if (inst.shape == "Mesh") {
					obj.scale.set(1, 1, 1);
				} else {
					obj.scale.set(inst.size[0], inst.size[1], inst.size[2]);
				}
			} else {
				// console.log(inst.shape)
				let data = await geometries[inst.shape].default(inst);
				let geo = data.geo || data;
				// console.log(geo);
				let mat = data.mat || new THREE.MeshPhongMaterial({
					color: `rgb(${Math.floor(inst.color[0] * 255)}, ${Math.floor(
						inst.color[1] * 255
					)}, ${Math.floor(inst.color[2] * 255)})`,
					specular: 0x222222
				});
				if (inst.decals) {
					let decals = {};
					for (let i = 0; i < inst.decals.length; i++) {
						let decal = inst.decals[i];
						let tex = getTexture(decal[0]);
						let decal_mat = mat.clone();
						decal_mat.map = tex;
						decal_mat.needsUpdate = true;
						decals[decal[1]] = decal_mat;
					}
					mat = [
						decals["Right"] || mat,
						decals["Left"] || mat,
						decals["Top"] || mat,
						decals["Bottom"] || mat,
						decals["Back"] || mat,
						decals["Front"] || mat
					]
				}
				let obj = new THREE.Mesh(geo, mat);
				scene.add(obj);
				objs[inst.id] = obj;
			}
		}
	}
}, 1000 / 60);

/**
 * Queues frames to be rendered
 * @param {array} frames The frames to be queued
 */
export default function queue_frames(frames) {
	queued_frames = frames;
}