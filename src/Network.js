import React from "react";
import HelpWindow from "./HelpWindow";
import AlgorithmAttributes from "./AlgorithmAttributes";
import TutorialWindow from "./TutorialWindow";
import createRandomNetwork from "./networkgeneration/createRandomNetwork";
import {springEmbedding} from "./NetworkAlgorithms/springEmbedding";
import {fruchtermanReingold} from "./NetworkAlgorithms/FruchtermanReingold";
import {kamadaKawai} from "./NetworkAlgorithms/kamadaKawai";
import {forceAtlas2} from "./NetworkAlgorithms/forceAtlas2";
import {forceAtlasLinLog} from "./NetworkAlgorithms/forceAtlasLinLog";
import {hall} from "./NetworkAlgorithms/Hall";
import {radialFlowDirected} from "./NetworkAlgorithms/radialFlowDirected";
import {spectralDrawing} from "./NetworkAlgorithms/spectralDrawing"
import getHelpInfo from "./helpInfoFunctions";

import "./Network.css";

var MAX_EDGES = 600;
// var MAX_TIMEOUT = 0;


class NetworkVisualizer extends React.Component{
  constructor(props){
    super(props);
    this.canvas =  React.createRef();
    this.state ={
      width : 0,
      height: 0,
      vertices: [],
      edges: [],
      numE: 300,
      numV: 120,
      animationSpeed: 50,
      running: false,
      sorted: false,
      iterations: 100,
      maxtimeouts: 0,
      connected : "False",
      maxDegree: Infinity,
      disconnected: 1,
      algoType: "spring",
      randomType: "random",
      layoutType: 0,
    };

    this.help = React.createRef();
    this.attribute = React.createRef();
    this.tutorial = React.createRef();
  }

  componentDidMount(){
    const w = window.innerHeight * 0.55;
    const h = window.innerHeight * 0.55;
    this.attribute.current.setState({parentHelp:this.help});

    const [vertices, edges] = createRandomNetwork(w, h, this.state.numV, this.state.numE);
    this.setState(
      {width: w,
      height: h,
      vertices: vertices,
      edges: edges,}
    );
  }

  componentDidUpdate(){
    this.canvas.current.width = this.state.width;
    this.canvas.current.height = this.state.height;
    const ctx = this.canvas.current.getContext("2d");
    for(let i =0; i < this.state.vertices.length; i++){
      ctx.beginPath();
      const c = this.state.vertices[i].color;
      ctx.fillStyle= c;
      // ctx.fillRect(this.state.vertices[i][0], this.state.vertices[i][1], 6, 6);
      ctx.arc(this.state.vertices[i].x, this.state.vertices[i].y, this.state.vertices[i].size, 0, Math.PI*2)
      ctx.fill();
      ctx.closePath();
    }

    for(let j = 0; j < this.state.edges.length; j++){
      ctx.beginPath();
      const index1 = this.state.edges[j].start;
      const index2 = this.state.edges[j].end;
      ctx.moveTo(this.state.vertices[index1].x,this.state.vertices[index1].y);
      ctx.lineTo(this.state.vertices[index2].x,this.state.vertices[index2].y);
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = this.state.edges[j].color;
      ctx.stroke();
      ctx.closePath();
    }
  }
  componentWillUnmount(){
      var id = this.state.maxtimeouts;
      while(id){
        clearInterval(id);
        id --;
      }
  }

  generateForceDirectedLayout(){
    const values = springEmbedding(this.state.vertices, this.state.edges,this.state.width, this.state.height, this.state.iterations, this.attribute.current.state.eps, this.attribute.current.state.delta, this.attribute.current.state.cspring, this.attribute.current.state.crep, this.attribute.current.state.cPercentage, this.attribute.current.state.distanceType);
    const new_vertices = values[0];
    const animations = values[1];
    this.animateNetwork(animations, new_vertices);
  }

  generateReingold(){
    const values = fruchtermanReingold(this.state.vertices, this.state.edges, this.state.width, this.state.height, this.state.iterations, this.attribute.current.state.tempHeuristic, this.attribute.current.state.cTemp, this.attribute.current.state.eps);
    const new_vertices = values[0];
    const animations = values[1];
    // console.log(animations);

    this.animateNetwork(animations, new_vertices);
  }

  generateKamadaKawai(){
    const values = kamadaKawai(this.state.vertices, this.state.edges, this.state.width, this.state.height, this.state.iterations);
  }

  generateForceAtlas2(){
    const values = forceAtlas2(this.state.vertices, this.state.edges, this.state.width, this.state.height, this.state.iterations, this.state.degree_array,  this.attribute.current.state.kr, this.attribute.current.state.gravity, this.attribute.current.state.gravityType, this.attribute.current.state.kg, this.attribute.current.state.tau, this.attribute.current.state.ksmax, this.attribute.current.state.overlappingNodes);
    const new_vertices = values[0];
    const animations = values[1];
    // console.log(new_vertices);
    // console.log(animations);

    this.animateNetwork(animations, new_vertices);
  }

  generateForceAtlasLinLog(){
    const values = forceAtlasLinLog(this.state.vertices, this.state.edges, this.state.width, this.state.height, this.state.iterations, this.state.degree_array, this.attribute.current.state.kr, this.attribute.current.state.gravity, this.attribute.current.state.gravityType, this.attribute.current.state.kg, this.attribute.current.state.tau, this.attribute.current.state.ksmax, this.attribute.current.state.overlappingNodes)
    const new_vertices = values[0];
    const animations = values[1];

    this.animateNetwork(animations, new_vertices);
  }

  generateHall(){

  }

  generateSpectralDrawing(){

  }

  generateRadialFlowDirected(){

  }

  runAlgorithm(){
    if(this.state.algoType === "spring") this.generateForceDirectedLayout();
    if(this.state.algoType === "fruchtermanReingold") this.generateReingold();
    if(this.state.algoType === "kamadaKawai") this.generateKamadaKawai();
    if(this.state.algoType === "forceAtlas2") this.generateForceAtlas2();
    if(this.state.algoType === "forceAtlasLinLog") this.generateForceAtlasLinLog();
    if(this.state.algoType === "hall") this.generateHall();
    if(this.state.algoType === "spectralDrawing") this.generateSpectralDrawing();
    if(this.state.algoType === "radialFlowDirected") this.generateRadialFlowDirected();
  }

  animateNetwork(animations, final_vertices){
    let x = 0;
    this.setState({running:true});
    for(let k = 0; k < animations.length; k++){

      x = setTimeout(() => {
        const vertices = this.state.vertices;
        for(let i = 0; i <vertices.length; i++){
          vertices[i].setVector(animations[k][i]);
        }
        this.setState({vertices: vertices});
        // console.log("animating")
        if(k === animations.length-1){
          this.setState({running:false, sorted:true, vertices:final_vertices});
          // console.log(final_vertices);
        }
      }, k * this.state.animationSpeed)
    }
    this.setState({maxtimeouts: x});
  }


  setVertices(v){
    const that = this;
    waitSetVertices(that,v);
  }

  setEdges(e){
    const that = this;
    waitSetEdges(that,e);
  }


  setAnimationSpeed(ms){
    const value = Math.abs(150-ms);
    this.setState({animationSpeed: value});
  }

  setConnected(v){
    const value = parseInt(v);
    const that = this;
    waitSetConnected(that, value);
  }
  setDisconnectedSubgraphs(v){
    const value = parseInt(v);
    this.setState({disconnected: value})
  }
  setAlgoType(v){
    this.attribute.current.setLayout(v)
    this.setState({algoType: v});
  }
  setRandomizedType(v){
    this.setState({randomType: v})
  }

  setHelp(v){
    var value = v;
    if(v === "algoType"){
      value = this.state.algoType;
    }
    this.attribute.current.help.current.setOpen(false)
    const [title, info, details, open] = getHelpInfo(value);
    this.help.current.setTitle(title);
    this.help.current.setInfo(info);
    this.help.current.setDetails(details)
    this.help.current.setOpen(open);
  }

  setLayoutType(v){
    const value = parseInt(v);
    this.setState({layoutType:value});
    if(value === 0){
      const w =  0.55*window.innerHeight;
      const h = 0.55*window.innerHeight;
      this.canvas.current.height = h;
      this.canvas.current.width = w;
      const that = this;
      waitSetLayout(that, w, h);
    }
    if(value === 1){
      const w =  0.97*window.innerWidth;
      const h = 0.55*window.innerHeight;
      this.canvas.current.height = h;
      this.canvas.current.width = w;
      const that = this;
      waitSetLayout(that, w, h);
      this.attribute.current.setState({delta: 0.2})
    }
  }

  resetNetwork(){
    const [vertices, edges] = createRandomNetwork(this.state.width, this.state.height, this.state.numV, this.state.numE, this.state.connected, this.state.randomType);

    this.setState(
      {vertices: vertices,
       edges: edges,
      }
    );
  }
  render(){

    return <div className = "network">
            <TutorialWindow ref = {this.tutorial}></TutorialWindow>
            <canvas
            className = "networkCanvas" ref = {this.canvas}>
            </canvas>
            <div className = "selectalgorow">

            <select className = "selectalgo" onChange = {(event) => this.setAlgoType(event.target.value)}>
              <optgroup label = "Force Directed Algorithms">
              <option value = "spring"> Basic Spring Embedding </option>
              <option value = "fruchtermanReingold" disabled = {true}> Fruchterman-Reingold </option>
              <option value = "kamadaKawai" disabled = {true}> Kamada-Kawai </option>
              <option value = "forceAtlas2" disabled = {true}> Force Atlas 2 (unfinished preview)</option>
              <option value = "forceAtlasLinLog" disabled = {true}> Force Atlas 2 (LinLog) (unfinished preview) </option>
              </optgroup>
              <optgroup label = "Spectral Layout Algorithms">
              <option value = "hall" disabled = {true}> Hall's algorithm </option>
              <option value = "spectralDrawing" disabled = {true}> Generalized Eigenvector Spectral Drawing (Koren)</option>
              </optgroup>
              <optgroup label = "Custom Algorithms">
                <option value = "radialFlowDirected" disabled = {true}>  Radial Flow Directed </option>
              </optgroup>
            </select>
            <button className = "helpbresized" onClick = {() => this.setHelp("algoType")}> ? </button>
            <button className = "b" onClick = {() => this.runAlgorithm()} disabled = {this.state.running}> Run Algorithm </button>

            <select className = "selectalgo" onChange = {(event) => this.setRandomizedType(event.target.value)}>
              <option value = "random"> Random </option>
              <option value = "randomcircle"> Random Circle </option>
              <option value = "randomsymmetry" disabled = {true}> Random Symmetry </option>
              <option value = "randomclustering" disabled = {true}> Random Clustering </option>
            </select>
            <button className = "helpbresized" onClick = {() => this.setHelp("randomType")}>?</button>
            <button className = "b" disabled = {this.state.running} onClick = {() => this.resetNetwork()}> Reset Network</button>

            <select className = "selectalgo" onChange = {(event) => this.setLayoutType(event.target.value)} disabled = {this.state.running}>
              <option value = "0"> Square </option>
              <option value = "1"> Stretch to Fit </option>
            </select>
            <button className = "helpbresized" onClick = {() => this.setHelp("Layout")}>?</button>

            </div>
            <HelpWindow ref = {this.help}></HelpWindow>


            <p className = "sliderHeader" style = {{color: "black"}}> <b>General Network Settings</b></p>
            <div className = "sliders">
              <input
              type = "range"
              min = "0"
              max = "130"
              value = {Math.abs(150-this.state.animationSpeed)}
              className = "slider"
              onChange = {(event)=> this.setAnimationSpeed(event.target.value)}
              disabled = {this.state.running}>
              </input>
              <label> AnimationSpeed : {this.state.animationSpeed}ms</label>
              <button className = "helpb" onClick = {() => this.setHelp("animation")}> ?</button>
              <input
              type = "range"
              min = "4"
              max = "200"
              value = {this.state.vertices.length}
              step = "1"
              className = "slider"
              name = "weight"
              disabled = {this.state.running}
              onChange = {(event) => this.setVertices(event.target.value)}>
              </input>
              <label> Vertices: {this.state.vertices.length}</label>
              <button className = "helpb" onClick = {() => this.setHelp("vertices")}> ?</button>
              <input
              type = "range"
              min =  {this.state.connected === "True"? this.state.vertices.length-1: Math.min(20, this.state.vertices.length-1)}
              max = {Math.min(Math.floor((this.state.vertices.length*this.state.vertices.length - this.state.vertices.length)/2), MAX_EDGES)}
              value = {this.state.edges.length}
              step = "1"
              className = "slider"
              name = "weight"
              disabled = {this.state.running}
              onChange = {(event) => this.setEdges(event.target.value)}>
              </input>
              <label> Edges: {this.state.edges.length}</label>
              <button className = "helpb" onClick = {() => this.setHelp("edges")}> ?</button>
              <input
              type = "range"
              min = "0"
              max = "1"
              value = {this.state.connected === "True"? "1":"0"}
              step = "1"
              className = "slider"
              onChange = {(event) => this.setConnected(event.target.value)}
              disabled = {this.state.running}>
              </input>
              <label> Force Connectedness: {this.state.connected} </label>
              <button className = "helpb" onClick = {() => this.setHelp("connectedness")}> ?</button>
              <input
              type = "range"
              min = "1"
              max = "3"
              step = "1"
              value = {this.state.disconnected}
              className = "slider"
              onChange = {(event) => this.setDisconnectedSubgraphs(event.target.value)}
              disabled = {true}>
              </input>
              <label>
              Disconnected Subgraphs: {this.state.disconnected}
              </label>
              <button className = "helpb" onClick = {() => this.setHelp("disconnected")}> ?</button>
            </div>



            <p className = "sliderHeader" style = {{color: "black"}}> <b>Algorithm Specific Network Settings</b></p>
            <AlgorithmAttributes ref = {this.attribute}></AlgorithmAttributes>


           </div>
  }
}

export default NetworkVisualizer;



async function waitSetConnected(that,value){
  if(value === 0) await that.setState({connected:"False"});
  if(value === 1) await that.setState({connected:"True"});
  that.resetNetwork();
}

async function waitSetVertices(that, v){
  await that.setState({numV: v});
  that.resetNetwork();
}

async function waitSetEdges(that,e){
  await that.setState({numE: e});
  that.resetNetwork();
}

async function waitSetLayout(that,w,h){
  await that.setState({height: h,width: w});
  that.resetNetwork();
}
