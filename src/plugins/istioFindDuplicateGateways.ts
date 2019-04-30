import _ from 'lodash'
import {ActionGroupSpec, ActionContextType, ActionOutputStyle, ActionOutput, ActionContextOrder} from '../actions/actionSpec'
import IstioFunctions from '../k8s/istioFunctions';


const plugin : ActionGroupSpec = {
  context: ActionContextType.Istio,
  title: "Istio Ingress Recipes",
  order: ActionContextOrder.Istio+1,
  actions: [
    {
      name: "Find Overlapping Gateways",
      order: 3,
      async act(actionContext) {
        this.onOutput && this.onOutput([["Overlapping Gateways"]], ActionOutputStyle.Table)

        const clusters = actionContext.getClusters()
        for(const cluster of clusters) {
          const output: ActionOutput = []
          output.push([">Cluster: " + cluster.name])
          if(cluster.hasIstio) {
            const gateways = await IstioFunctions.listAllGateways(cluster.k8sClient)
            const gatewayServerCombis = _.flatten(gateways.map(g => g.servers.map(s => {
              return {gateway: g, server: s}
            })))
            const portHostGatewayMap = {}
            gatewayServerCombis.forEach(gs => {
              portHostGatewayMap[gs.server.port.number] = portHostGatewayMap[gs.server.port.number] || {}
              gs.server.hosts.forEach(host => {
                portHostGatewayMap[gs.server.port.number][host] = portHostGatewayMap[gs.server.port.number][host] || []
                portHostGatewayMap[gs.server.port.number][host].push(gs.gateway)
              })
            })
            Object.keys(portHostGatewayMap).forEach(port => {
              Object.keys(portHostGatewayMap[port]).forEach(host => {
                if(portHostGatewayMap[port][host].length > 1) {
                  output.push([">>Host: " + host + " in multiple gateways for port " + port])
                  portHostGatewayMap[port][host].forEach(g => output.push([">>>Gateway: " + g.name+"."+g.namespace], [g.yaml]))
                }
              })
            })
          } else {
            output.push(["Istio not installed"])
          }
          this.onStreamOutput && this.onStreamOutput(output)
        }
      }
    },
  ]
}

export default plugin
