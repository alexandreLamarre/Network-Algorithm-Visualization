import React from "react";
import Modal from "react-modal";
import AlgorithmAttributes from"./AlgorithmAttributes";

import "./NetworkAlgorithmSettings.css"

class NetworkAlgorithmSettings extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      open: false,
      spring: {},
      fruchterman: {},
      forceatlas2: {},
      forceatlaslinlog: {},
    }
    this.attributes = React.createRef();
  }

  setOpen(v){
    this.setState({open:v});
  }


  render(){
    return <div>
              <Modal
              isOpen = {this.state.open}
              onRequestClose = {() => this.setOpen(false)}
              className = "algorithmsettings"
              overlayClassName = "algorithmsettingsoverlay">
                <AlgorithmAttributes settings = {this} ref= {this.attributes}/>
              </Modal>
           </div>
  }
}

export default NetworkAlgorithmSettings;