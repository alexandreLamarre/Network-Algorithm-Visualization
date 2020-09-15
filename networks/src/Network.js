import React from "react";
import HelpWindow from "./HelpWindow";
import AlgorithmAttributes from "./AlgorithmAttributes";
import {springEmbedding} from "./NetworkAlgorithms/springEmbedding";
import {fruchtermanReingold} from "./NetworkAlgorithms/FruchtermanReingold";
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
  }

  componentDidMount(){
    const w = window.innerHeight * 0.55;
    const h = window.innerHeight * 0.55;
    this.attribute.current.setState({parentHelp:this.help});

    const [vertices, edges, maxedges] = createRandomNetwork(w, h, this.state.numV, this.state.numE);
    this.setState({width: w, height: h, vertices: vertices, edges: edges, maxEdges: maxedges});
  }

  componentDidUpdate(){
    this.canvas.current.width = this.state.width;
    this.canvas.current.height = this.state.height;
    const ctx = this.canvas.current.getContext("2d");
    for(let i =0; i < this.state.vertices.length; i++){
      ctx.fillStyle= "#FF0000"
      ctx.fillRect(this.state.vertices[i][0], this.state.vertices[i][1], 6, 6);
    }

    for(let j = 0; j < this.state.edges.length; j++){
      ctx.beginPath();
      ctx.globalAlpha = 0.2;
      const index1 = this.state.edges[j][0];
      const index2 = this.state.edges[j][1];
      ctx.moveTo(this.state.vertices[index1][0]+3,this.state.vertices[index1][1]+3 );
      ctx.lineTo(this.state.vertices[index2][0]+3,this.state.vertices[index2][1]+3 );
      // ctx.moveTo(this.state.vertices[j][0][0]+3, this.state.edges[j][0][1]+3);
      // ctx.lineTo(this.state.edges[j][1][0]+3, this.state.edges[j][1][1]+3);
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
    const values = fruchtermanReingold(this.state.vertices, this.state.edges, this.state.width, this.state.height, this.state.iterations, this.attribute.current.state.tempHeuristic, this.attribute.current.state.cTemp, this.attribute.current.state.collision);
    const new_vertices = values[0];
    const animations = values[1];
    // console.log(animations);

    this.animateNetwork(animations, new_vertices);
  }

  runAlgorithm(){
    if(this.state.algoType === "spring") this.generateForceDirectedLayout();
    if(this.state.algoType === "fruchtermanReingold") this.generateReingold();
  }

  animateNetwork(animations, final_vertices){
    let x = 0;
    this.setState({running:true});
    for(let k = 0; k < animations.length; k++){

      x = setTimeout(() => {
        this.setState({vertices: animations[k]});
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
    const [vertices, edges, maxedges] = createRandomNetwork(this.state.width, this.state.height, this.state.numV, this.state.numE, this.state.connected, this.state.randomType);

    this.setState({vertices: vertices, edges: edges, sorted:false, maxEdges:maxedges})
  }
  render(){

    return <div className = "network">
            <canvas
            className = "networkCanvas" ref = {this.canvas}>
            </canvas>
            <div className = "selectalgorow">

            <select className = "selectalgo" onChange = {(event) => this.setAlgoType(event.target.value)}>
              <option value = "spring"> Basic Spring Embedding </option>
              <option value = "fruchtermanReingold"> FruchtermanReingold </option>
            </select>
            <button className = "helpbresized" onClick = {() => this.setHelp("algoType")}> ? </button>
            <button className = "b" onClick = {() => this.runAlgorithm()} disabled = {this.state.running}> Run Algorithm </button>

            <select className = "selectalgo" onChange = {(event) => this.setRandomizedType(event.target.value)}>
              <option value = "random"> Random </option>
              <option value = "randomcircle"> Random Circle </option>
              <option value = "randomsymmetry" disabled = {true}> Random Symmetry </option>
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


            <p className = "sliderHeader" style = {{color: "black"}}> <b>General Network Attributes</b></p>
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



            <p className = "sliderHeader" style = {{color: "black"}}> <b>Algorithm Specific Network Attributes</b></p>
            <AlgorithmAttributes ref = {this.attribute}></AlgorithmAttributes>


           </div>
  }
}

export default NetworkVisualizer;

function createRandomNetwork(maxWidth, maxHeight, numV, numE, conn, randomType){
  let connected = conn === undefined? "False": conn;
  let seed = randomType === undefined? "random": randomType;
  const maxDegree = numV-1;
  let maxEdges = Math.floor((maxDegree*numV)/2)
  const maxEdgesValue = maxEdges;
  // console.log("maxedges")
  // console.log("vertices", numV, "maxedges", maxEdgesValue);
  let vertices = [];
  let available_vertices = [];
  let degree_array = [];
  const center = [maxWidth/2, maxHeight/2];
  const radius = (maxHeight/2)*0.90;

  for(let i = 0; i < numV; i ++){
    var point = [0,0]
    if(seed === "random") point = createRandomPos(maxWidth, maxHeight);
    if(seed === "randomcircle") point = createRandomPosCircle(center, radius);
    vertices.push(point);
    available_vertices.push(i);
    degree_array.push(0);
  }

  let already_connected = new Map();
  let edges = [];
  let remainingEdges = numE;
  if(connected === "True"){
    let unvisited = [];
    for(var i = 0; i < numV; i++){
      unvisited.push(i);
    }
    let visited = [];
    var vIndex1 = pickRandomVertex(unvisited);
    var v1 = unvisited[vIndex1];
    visited.push(v1);
    unvisited = removeFromArray(unvisited, vIndex1);

    var visited_num = 1;
    while(visited_num < numV){
      var vIndex2 = pickRandomVertex(unvisited)
      var v2 = unvisited[vIndex2];
      visited.push(v2); //add to visited
      edges.push([v1,v2]);
      degree_array[v1] ++;
      degree_array[v2] ++;
      remainingEdges --;
      maxEdges --;
      const indexTo = v1 + 1000* v2; // works as long as numV < 1000
      const indexFrom = v2+ 1000*v1;
      already_connected.set(indexTo, true);
      already_connected.set(indexFrom, true);
      //remove from unvisited
      unvisited = removeFromArray(unvisited, vIndex2);
      //reset v1
      vIndex1 = pickRandomVertex(visited);
      v1 = visited[vIndex1];
      visited_num ++;
    }
  }
  // for(let i = 0; i < vertices.length; i++){
  //   already_connected.set(i.toString() + i.toString(), true);
  // }

  // var available_index = vertices.length // starts out as vertex.length;
  while(remainingEdges > 0 && maxEdges > 0 && available_vertices.length > 1){
    const [random1, random2] = connectRandomVertices(available_vertices.slice());
    if(random1 === random2) console.log("unexpected");
    if(random1 === undefined) console.log("unexpected undefiend 1");
    if(random2 === undefined) console.log("unexpected undefined 2");
    // console.log("rem:", remainingEdges, "max", maxEdges);
    const indexTo = random1+1000*random2; // as long as numV < 1000 this works
    const indexFrom = random2+1000*random1;
    if(already_connected.get(indexTo) === undefined ){
      edges.push([random1, random2]);
      degree_array[random1] ++;
      degree_array[random2] ++;
      if(degree_array[random1] > maxDegree) available_vertices.splice(random1, 1);
      if(degree_array[random2] > maxDegree) available_vertices.splice(random2, 1);
      already_connected.set(indexTo, true);
      already_connected.set(indexFrom, true);
      remainingEdges --;
      maxEdges --;
      }
    }
  // console.log("degree_array", degree_array);
  // console.log("edges", edges);
  return [vertices,edges,Math.min(maxEdgesValue, MAX_EDGES)];
}

function createRandomPos(maxWidth, maxHeight){
  return [Math.random()*(maxWidth+1-3), Math.random()*(maxHeight+1-3)];
}

function createRandomPosCircle(center,radius){
  const randomAngle = Math.random()*(2*Math.PI);
  return [center[0] + radius*Math.cos(randomAngle), center[1]+radius*Math.sin(randomAngle)];
}

function connectRandomVertices(vertices){
  var random1 = vertices[Math.floor(Math.random()*vertices.length)];
  vertices.splice(random1,1);
  var random2 = vertices[Math.floor(Math.random()*vertices.length)];

  return [random1, random2];
}

function pickRandomVertex(array){
  return Math.floor(Math.random()*array.length)
}

function removeFromArray(array, index){
  return array.slice(0,index).concat(array.slice(index+1))
}

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