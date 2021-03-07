import React from "react";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import Network from "./Network";

class NetworkVisualizer3D extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            width: 0,
            height: 0,
            network: null,
            spheres: [],
            lines : [],
            scene : null,
            camera: null,
            renderer: null,
            controls: null,
        }
        this.heightConstant= 8.5/10
        this.widthConstant = 7/10
        this.minheight = 420
        this.network3D = React.createRef()
        this.networkData = this.props.networkData
        this.animator = this.props.animator

        this.renderer = null
        this.controls = null
        this.scene = null
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1)
        this.pointLight = new THREE.PointLight(0xffffff, 1);
        this.pointLight.position.set(1,1,2)
        this.camera.add(this.pointLight)

        this.spheres = []
        this.lines = []

    }


    async componentDidMount(){
        //set up default constants and what not
        const w = window.innerWidth * this.widthConstant
        const h = window.innerHeight * this.heightConstant
        this.network3D.current.width = w
        this.network3D.current.height = h

        await this.props.parent.resetAnimationLogic() //clear any animations loaded when changing network visualizations
        this.networkData.set3D(true)
        this.networkData.createRandomNetwork()
        const network = this.networkData


        //set 3D graphics variables
        this.renderer = new THREE.WebGLRenderer({canvas: this.network3D.current, alpha:true})
        this.renderer.setSize(w, h)
        this.camera.aspect = (w/h)
        this.controls = new OrbitControls(this.camera, this.network3D.current)
        this.controls.target.set( w/2, h/2, h/2);
        this.camera.position.set(w/2, h/2, 1.7*h)
        this.controls.update()

        //setup initial scene
        this.resetSceneFromData(w, h)


        this.renderer.render(this.scene, this.camera)


        //add listeners and set state
        window.addEventListener("resize", () => {this.resize()})
        window.requestAnimationFrame(() => this.animate())
        this.setState({width: w, height: h})
    }

    animate(){
        if(this.networkData !== null && this.network3D.current !== null){
            if(this.networkData.shouldReset()){
                this.networkData.createRandomNetwork()
                this.resetSceneFromData(this.state.width, this.state.height)
            } else if (this.networkData.shouldUpdate){
                this.updateScene()
                this.networkData.shouldUpdate = false
            }
            this.renderer.render(this.scene, this.camera)
            window.requestAnimationFrame(() => this.animate())
        }
    }

    resetSceneFromData(w, h){
        this.scene = new THREE.Scene()
        this.scene.add(this.camera)
        const spheres = []
        for(let i = 0; i < this.networkData.vertices.length; i++){
            const v = this.networkData.vertices[i]
            var geometrySphere = new THREE.SphereGeometry(v.size, 4, 4)
            var materialSphere = new THREE.MeshLambertMaterial({color: new THREE.Color(v.color)})
            var sphere = new THREE.Mesh(geometrySphere, materialSphere);
            sphere.position.set(v.x* w, v.y*h, v.z*h)
            spheres.push(sphere)
            this.scene.add(sphere)
        }

        const lines = []
        for(let j = 0; j < this.networkData.edges.length; j++){
            const e = this.networkData.edges[j]
            var linePoints = []
            var material = new THREE.LineBasicMaterial({color: new THREE.Color(e.color)});
            material.opacity = 0.1
            linePoints.push(spheres[e.start].position)
            linePoints.push(spheres[e.end].position)
            var geometry = new THREE.BufferGeometry().setFromPoints(linePoints)
            var line = new THREE.Line(geometry, material)
            this.scene.add(line)
            lines.push(line)
        }
        this.spheres = spheres
        this.lines = lines
    }

    updateScene(){
        const h = Math.max(window.innerHeight *this.heightConstant, this.minheight)
        const w = window.innerWidth  * this.widthConstant
        for(let i = 0; i < this.networkData.vertices.length; i++){
            const v = this.networkData.vertices[i]
            this.spheres[i].position.set(v.x*w, v.y*h, v.z*h);
            this.spheres[i].material.color.set(v.color);
        }

        for(let j = 0; j < this.networkData.edges.length; j++){
            // if(j == 0) console.log(this.networkData.edges[j].color)
            this.lines[j].material.color = new THREE.Color(this.networkData.edges[j].color)
            const v= this.networkData.vertices
            const e = this.networkData.edges[j]

            var linePoints = []
            linePoints.push(this.spheres[e.start].position)
            linePoints.push(this.spheres[e.end].position)


            this.lines[j].geometry.setFromPoints(linePoints)
            this.lines[j].geometry.attributes.position.needsUpdate = true;

            // this.lines[j].material.color.set(this.networkData.edges[j].color);
        }
    }

    resize(){
        const h = Math.max(window.innerHeight *this.heightConstant, this.minheight)
        const w = window.innerWidth  * this.widthConstant
        if (this.network3D.current != null){
            this.network3D.current.width = w
            this.network3D.current.height = h
            this.camera.aspect = w/h
            this.renderer.setSize(w, h)
            this.controls.target.set(w/2, h/2, h/2)
            this.controls.update()
            this.networkData.shouldUpdate = true
        }
        this.setState({height: h, width: w})
    }

    render() {
        return (
            <div>
                <canvas ref = {this.network3D}
                        style = {{outline: "1px solid blue",
                        backgroundColor: "black"
                        }}/>
            </div>
        )
    }
}

export default NetworkVisualizer3D