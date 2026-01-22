import { BiddingCatalogEntity } from "../entity/bidding-catalog.entity";

export interface IBiddingCatalogRepository {
    findByName(name: string): Promise<BiddingCatalogEntity | null>;
}
