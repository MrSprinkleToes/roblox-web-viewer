import * as THREE from "../../three.js-r137/build/three.module.js";

let geo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 16);
export default function cylinder() {
	return geo;
}