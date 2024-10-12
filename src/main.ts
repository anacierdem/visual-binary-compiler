import "./style.css";
import "litegraph.js/css/litegraph.css";

import { LGraph, LGraphCanvas, LiteGraph } from "litegraph.js";
import { Sum } from "./nodes/sum";
import { Number } from "./nodes/number";
import { Log } from "./nodes/log";
import { Serial } from "./nodes/serial";

LiteGraph.clearRegisteredTypes();
//register in the system
LiteGraph.registerNodeType("basic/sum", Sum);
LiteGraph.registerNodeType("basic/number", Number);
LiteGraph.registerNodeType("basic/log", Log);
LiteGraph.registerNodeType("basic/serial", Serial);

var graph = new LGraph();

var canvas = new LGraphCanvas("#mycanvas", graph);

var node_const = LiteGraph.createNode("basic/number");
node_const.pos = [200, 200];
graph.add(node_const);

var node_log = LiteGraph.createNode("basic/log");
node_log.pos = [700, 200];
graph.add(node_log);

node_const.connect(0, node_log, 0);

var node_serial = LiteGraph.createNode("basic/serial");
node_serial.pos = [700, 400];
graph.add(node_serial);

// canvas.switchLiveMode(false);
// graph.start();
graph.runStep();

