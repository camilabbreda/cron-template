import axios from 'axios';
import { CampaignData, responseBlip } from '../types/blip-types';

export default class ApiBlip {
    private blipUrl
    private auth
    private contentType

    constructor() {
        this.blipUrl = `${process.env.API_BLIP_URL}`
        this.auth = `${process.env.API_BLIP_AUTH}`
        this.contentType = "application/json"
    }

    async postWhatsappNotificationMessage(campaignData: CampaignData): Promise<responseBlip> {
        const { phone, stateId, templateName, audience, campaignName, message } = campaignData

        const body = {
            id: crypto.randomUUID(),
            to: 'postmaster@activecampaign.msging.net',
            method: 'set',
            uri: '/campaign/full',
            type: 'application/vnd.iris.activecampaign.full-campaign+json',
            resource: {
                campaign: {
                    name: `${campaignName}_${crypto.randomUUID()}`,
                    campaignType: 'Individual',
                    flowId: process.env.TEMPLATE_ACTIVE_MESSAGE_FLOWID,
                    stateId,
                    masterstate: process.env.TEMPLATE_MASTER_SATE,
                    channelType: 'WhatsApp'
                },
                audience: {
                    recipient: phone,
                    messageParams: audience.messageParams
                },
                message: {
                    messageTemplate: templateName,
                    messageParams: message.messageParams,
                    channelType: 'WhatsApp'
                }
            }
        };

        const response = await axios.post(`${this.blipUrl}/commands`, {...body}, { headers: { Authorization: this.auth, 'Content-Type': this.contentType } });
        return response.data
    }

}