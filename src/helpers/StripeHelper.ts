import axios from "axios";
import { StripeConfig } from "../types/StripeTypes";
import { ApiHelper } from "./ApiHelper";

export class StripeHelper extends ApiHelper {
    async getConfig() {
        return await axios.get<StripeConfig>("/stripe/config");
    }
}