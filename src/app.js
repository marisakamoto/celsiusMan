// WebXR requires HTTPS, so the site doesn't work if someone manually enters
// the URL and ends up using HTTP. To work around this, force redirect from
// http to https for non-localhost addresses.
if (window.location.protocol == "http:" &&
    window.location.hostname != "localhost" &&
    window.location.hostname != "127.0.0.1" &&
    window.location.hostname != "[::1]") {
    window.location = window.location.href.replace('http:', 'https:');
}

// Define a few custom components useful for AR mode. While these are somewhat reusable,
// I recommend checking if there are officially supported alternatives before copying
// these into new projects.

// See also https://github.com/aframevr/aframe/pull/4356
AFRAME.registerComponent('hide-in-ar-mode', {
    // Set this object invisible while in AR mode.
    init: function() {
        this.el.sceneEl.addEventListener('enter-vr', (ev) => {
            this.wasVisible = this.el.getAttribute('visible');
            if (this.el.sceneEl.is('ar-mode')) {
                this.el.setAttribute('visible', false);
            }
        });
        this.el.sceneEl.addEventListener('exit-vr', (ev) => {
            if (this.wasVisible) this.el.setAttribute('visible', true);
        });
    }
});

AFRAME.registerComponent('ar-shadows', {
    // Swap an object's material to a transparent shadows-only material while
    // in AR mode. Intended for use with a ground plane. The object is also
    // set visible while in AR mode, this is useful if it's hidden in other
    // modes due to them using a 3D environment.
    schema: {
        opacity: {
            default: 0.3
        }
    },
    init: function() {
        this.el.sceneEl.addEventListener('enter-vr', (ev) => {
            this.wasVisible = this.el.getAttribute('visible');
            if (this.el.sceneEl.is('ar-mode')) {
                this.savedMaterial = this.el.object3D.children[0].material;
                this.el.object3D.children[0].material = new THREE.ShadowMaterial();
                this.el.object3D.children[0].material.opacity = this.data.opacity;
                this.el.setAttribute('visible', true);
            }
        });
        this.el.sceneEl.addEventListener('exit-vr', (ev) => {
            if (this.savedMaterial) {
                this.el.object3D.children[0].material = this.savedMaterial;
                this.savedMaterial = null;
            }
            if (!this.wasVisible) this.el.setAttribute('visible', false);
        });
    }
});

// Faz o homem seguir o cursor

function onSceneLoaded() {
    const raycaster = document.querySelector('[ar-raycaster]');
    const cursor = document.querySelector('#cursor');
    raycaster.addEventListener('raycaster-intersection', (event) => {
        cursor.setAttribute('position', event.detail.intersections[0].point);
    });
}

const scene = document.querySelector('a-scene');
scene.addEventListener('loaded', onSceneLoaded);


const walker = document.querySelector('#walker');
raycaster.addEventListener('click', () => {
    walker.setAttribute('position', raycaster.components.cursor.intersection.point);
});

const walker = document.querySelector('#walker');
const { stringify } = AFRAME.utils.coordinates;

let firstTime = true;
raycaster.addEventListener('click', () => {
    const target = raycaster.components.cursor.intersection.point;

    if (firstTime) {
        walker.setAttribute('position', target);
        firstTime = false;
    } else {
        const animation = document.createElement('a-animation');
        animation.setAttribute('attribute', 'position');
        animation.setAttribute('to', stringify(target));
        animation.setAttribute('dur', 5000);
        animation.setAttribute('easing', 'linear');
        walker.appendChild(animation);
    }
});