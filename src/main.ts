import './litegraph/litegraph.css';
import './style.css';

import { LGraph, LGraphCanvas } from './litegraph/lgraph.ts';
import { LiteGraph } from './litegraph/litegraph.ts';

// TODO: register all nodes here instead of in the node files
import './litegraph/nodes/events';
import './litegraph/nodes/base';
import './litegraph/nodes/logic';
import './litegraph/nodes/interface';
import { Log } from './nodes/log';
import { Serial } from './nodes/serial';
import { Read } from './nodes/read.js';
import { Uint8 } from './nodes/uint8.js';
import { Matcher } from './nodes/matcher/index.ts';

// LiteGraph.clearRegisteredTypes();
// LiteGraph.registerNodeType('basic/log', Log);
LiteGraph.registerNodeType('serial/serial', Serial);
LiteGraph.registerNodeType('serial/read', Read);
LiteGraph.registerNodeType('serial/uint8', Uint8);
LiteGraph.registerNodeType('serial/matcher', Matcher);

// This fixes a bug with some of the internal nodes
window.LGraph = LiteGraph;

function resize() {
  const ctx = document.getElementById('mycanvas').getContext('2d');
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
}

const initialGraph =
  '{"last_node_id":26,"last_link_id":25,"nodes":[{"id":18,"type":"basic/script","pos":[599,560],"size":{"0":140,"1":46},"flags":{},"order":0,"mode":0,"inputs":[{"name":"A","type":0,"link":null},{"name":"B","type":0,"link":null}],"outputs":[{"name":"out","type":0,"links":null}],"properties":{"onExecute":"return A;"}},{"id":13,"type":"graph/subgraph","pos":[484,357],"size":[200,90],"flags":{},"order":5,"mode":0,"inputs":[{"name":"onTrigger","type":-1,"link":15,"optional":true,"nameLocked":true},{"name":"DSR","type":"boolean","link":16}],"outputs":[{"name":"DTR","type":"boolean","links":[17],"slot_index":1}],"properties":{"enabled":true},"subgraph":{"last_node_id":11,"last_link_id":10,"nodes":[{"id":6,"type":"events/trigger","pos":[336,463],"size":{"0":140,"1":66},"flags":{},"order":3,"mode":0,"inputs":[{"name":"if","type":0,"link":3}],"outputs":[{"name":"true","type":-1,"links":[4],"slot_index":0},{"name":"change","type":-1,"links":null},{"name":"false","type":-1,"links":null}],"properties":{"only_on_change":false}},{"id":8,"type":"graph/output","pos":[814,229],"size":[180,60],"flags":{},"order":6,"mode":0,"inputs":[{"name":"","type":"boolean","link":7}],"properties":{"name":"DTR","type":"boolean"}},{"id":7,"type":"basic/variable","pos":[596,375],"size":{"0":169.60000610351562,"1":46},"flags":{},"order":5,"mode":3,"inputs":[{"name":"in","type":0,"link":5},{"name":"onTrigger","type":-1,"link":6,"optional":true,"nameLocked":true}],"outputs":[{"name":"out","links":[7,9],"slot_index":0},{"name":"onExecuted","type":-1,"links":[],"optional":true,"nameLocked":true,"slot_index":1}],"properties":{"varname":"myname","container":0}},{"id":10,"type":"basic/variable","pos":[785,476],"size":{"0":140,"1":26},"flags":{},"order":7,"mode":0,"inputs":[{"name":"in","type":0,"link":9}],"outputs":[{"name":"out","links":[]}],"properties":{"varname":"myname","container":0}},{"id":4,"type":"graph/input","pos":[65,208],"size":[180,90],"flags":{},"order":0,"mode":0,"outputs":[{"name":"","type":-1,"links":[2],"slot_index":0}],"properties":{"name":"onTrigger","type":-1,"value":null}},{"id":5,"type":"events/sequence","pos":[490,210],"size":[90,70],"flags":{"horizontal":true,"render_box":false},"order":4,"mode":0,"inputs":[{"name":"","type":-1,"link":2},{"name":"","type":-1,"link":4},{"name":"","type":-1,"link":null}],"outputs":[{"name":"","type":-1,"links":[6],"slot_index":0},{"name":"","type":-1,"links":null},{"name":"","type":-1,"links":null}],"properties":{}},{"id":2,"type":"logic/NOT","pos":[320,380],"size":{"0":140,"1":26},"flags":{},"order":2,"mode":0,"inputs":[{"name":"in","type":"boolean","link":1}],"outputs":[{"name":"out","type":"boolean","links":[5],"slot_index":0}],"properties":{}},{"id":3,"type":"graph/input","pos":[75,373],"size":[180,90],"flags":{},"order":1,"mode":0,"outputs":[{"name":"","type":"boolean","links":[1,3],"slot_index":0}],"properties":{"name":"DSR","type":"boolean","value":true}}],"links":[[1,3,0,2,0,"boolean"],[2,4,0,5,0,-1],[3,3,0,6,0,"boolean"],[4,6,0,5,1,-1],[5,2,0,7,0,"boolean"],[6,5,0,7,1,-1],[7,7,0,8,0,"boolean"],[9,7,0,10,0,null]],"groups":[],"config":{},"extra":{},"version":0.4}},{"id":26,"type":"basic/const","pos":[734,339],"size":[180,30],"flags":{},"order":1,"mode":0,"outputs":[{"name":"value","type":"number","links":[24],"label":"1.000","slot_index":0}],"properties":{"value":1}},{"id":22,"type":"serial/read","pos":{"0":1002,"1":211,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0},"size":{"0":152.8000030517578,"1":66},"flags":{},"order":7,"mode":0,"inputs":[{"name":"in","type":"ReadableStream","link":21},{"name":"offset","type":"number","link":23},{"name":"length","type":"number","link":24}],"outputs":[{"name":"match","type":"ArrayBuffer","links":[25],"slot_index":0},{"name":"passthrough","type":"ReadableStream","links":null},{"name":"matched","type":-1,"links":null}],"properties":{}},{"id":4,"type":"widget/button","pos":[231,353],"size":[164,84],"flags":{},"order":2,"mode":0,"outputs":[{"name":"","type":-1,"links":[15],"slot_index":0},{"name":"","type":"boolean","links":null}],"properties":{"text":"click me","font_size":30,"message":""}},{"id":3,"type":"serial/serial","pos":{"0":411,"1":73,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0},"size":{"0":295.6000061035156,"1":142},"flags":{},"order":4,"mode":0,"inputs":[{"name":"onEvent","type":-1,"link":null},{"name":"dataTerminalReady","type":"boolean","link":17},{"name":"requestToSend","type":"boolean","link":null},{"name":"break","type":"boolean","link":null}],"outputs":[{"name":"clearToSend","type":"boolean","links":null},{"name":"dataCarrierDetect","type":"boolean","links":null},{"name":"dataSetReady","type":"boolean","links":[16],"slot_index":2},{"name":"ringIndicator","type":"boolean","links":null},{"name":"tx","type":"ReadableStream","links":[21],"slot_index":4}],"properties":{"baudRate":115200,"dataBits":8,"stopBits":1,"parity":"none","bufferSize":256,"flowControl":"none"}},{"id":25,"type":"basic/const","pos":[738,248],"size":[180,30],"flags":{},"order":3,"mode":0,"outputs":[{"name":"value","type":"number","links":[23],"label":"3.000","slot_index":0}],"properties":{"value":3}},{"id":21,"type":"serial/uint8","pos":{"0":1176,"1":349,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0},"size":{"0":140,"1":26},"flags":{},"order":6,"mode":0,"inputs":[{"name":"in","type":"ArrayBuffer","link":25}],"outputs":[],"properties":{}}],"links":[[15,4,0,13,0,-1],[16,3,2,13,1,"boolean"],[17,13,0,3,1,"boolean"],[21,3,4,22,0,"ReadableStream"],[23,25,0,22,1,"number"],[24,26,0,22,2,"number"],[25,22,0,21,0,"ArrayBuffer"]],"groups":[],"config":{},"extra":{},"version":0.4}';

var graph = new LGraph(JSON.parse(localStorage.graph || initialGraph));

// Hijack graph to manually call `serialize` on it
window.graph = graph;

var canvas = new LGraphCanvas('#mycanvas', graph);
resize();

document.getElementById('btn').addEventListener('click', () => {
  canvas.switchLiveMode(false);
});

document.getElementById('save-btn').addEventListener('click', () => {
  localStorage.graph = JSON.stringify(graph.serialize());
});

addEventListener('resize', (event) => {
  resize();
  canvas.draw(true, true);
});

LiteGraph.allow_scripts = true;

graph.start();
