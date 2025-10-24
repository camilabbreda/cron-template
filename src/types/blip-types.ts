export type CampaignData = {
    phone: string,
    campaignName: string,
    stateId: string,
    templateName: string,
    audience: {
        messageParams: object | null,
    },
    message: {
        messageParams: string[] | null,
    }
}

export type responseBlip = {
  type: string,
  resource: {
    id: string,
    name: string,
    campaignType: "INDIVIDUAL",
    masterState: string,
    flowId: string,
    stateId: string,
    status: "processing",
    created: string,
    tags: [
    ],
    isToUseLiteApi: boolean,
    channelType: "WHATSAPP",
    canSendWithOpenTicket: boolean,
  },
  method: "set",
  status: "success" | "failure",
  id: string,
  from: string,
  to: string,
  metadata: {
    traceparent: string,
    "#command.uri": string,
    "#metrics.custom.label": string,
  },
}

