import { Request, Response } from 'express';
export declare class ProductOptionsController {
    createProductOption: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getProductOption: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getProductOptions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateProductOption: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteProductOption: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    addOptionValue: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateOptionValue: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteOptionValue: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getProductWithOptions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    validateProductOptions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    calculateOptionPricing: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    bulkOptionOperation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    applyOptionTemplate: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getOptionTemplates: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    cloneProductOptions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    reorderProductOptions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
}
export declare const productOptionsController: ProductOptionsController;
//# sourceMappingURL=productOptionsController.d.ts.map