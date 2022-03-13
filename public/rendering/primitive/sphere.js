import * as THREE from "../../three.js-r137/build/three.module.js";

let geo = new THREE.SphereGeometry(0.5, 16, 16);
export default function sphere() {
	return geo;
}