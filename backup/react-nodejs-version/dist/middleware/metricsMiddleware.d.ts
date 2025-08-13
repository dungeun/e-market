import { Request, Response, NextFunction } from 'express';
export interface MetricsRequest extends Request {
    startTime?: number;
}
export declare const metricsMiddleware: (req: MetricsRequest, res: Response, next: NextFunction) => void;
export declare const businessMetricsMiddleware: (req: Request, res: Response, next: NextFunction) => void;
declare const _default: {
    metricsMiddleware: (req: MetricsRequest, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    businessMetricsMiddleware: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
};
export default _default;
//# sourceMappingURL=metricsMiddleware.d.ts.map