import "./style.css";
import "litegraph.js/css/litegraph.css";

import { LGraph, LGraphCanvas, LiteGraph } from "litegraph.js";
import { Sum } from "./nodes/sum";
import { Number } from "./nodes/number";
import { Log } from "./nodes/log";

LiteGraph.clearRegisteredTypes();
//register in the system
LiteGraph.registerNodeType("basic/sum", Sum);
LiteGraph.registerNodeType("basic/number", Number);
LiteGraph.registerNodeType("basic/log", Log);

var graph = new LGraph();

new LGraphCanvas("#mycanvas", graph);


var node_const = LiteGraph.createNode("basic/number");
node_const.pos = [200, 200];
graph.add(node_const);

var node_log = LiteGraph.createNode("basic/log");
node_log.pos = [700, 200];
graph.add(node_log);

node_const.connect(0, node_log, 0);

// graph.start();
graph.runStep();


