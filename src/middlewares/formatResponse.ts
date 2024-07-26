import { Request, Response, NextFunction } from "express";

export function responseFormatter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.json = ((originalJson) => (body: any) => {
    const formattedBody = {
      code: res.statusCode,
      status: res.statusCode >= 400 ? "failed" : "success",
      data: body,
    };

    return originalJson.call(res, formattedBody);
  })(res.json);

  next();
}
