import { Request, Response } from 'express';
export declare class PricingController {
    calculatePrice(req: Request, res: Response): Promise<void>;
    calculateBulkPricing(req: Request, res: Response): Promise<void>;
    createPricingRule(req: Request, res: Response): Promise<void>;
    updatePricingRule(req: Request, res: Response): Promise<void>;
    getPricingRules(req: Request, res: Response): Promise<void>;
    getPricingRule(req: Request, res: Response): Promise<void>;
    deletePricingRule(req: Request, res: Response): Promise<void>;
    getPricingAnalytics(req: Request, res: Response): Promise<void>;
    testPricingRule(req: Request, res: Response): Promise<void>;
    previewPricing(req: Request, res: Response): Promise<void>;
}
export declare const pricingController: PricingController;
//# sourceMappingURL=pricingController.d.ts.map