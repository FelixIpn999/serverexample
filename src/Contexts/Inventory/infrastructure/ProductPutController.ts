import {Request, Response, NextFunction} from "express";
import {ProductCreator} from "../application/ProductCreator";
import {injectable} from "tsyringe";
import {ProductPutDto} from "./dtos/ProductPut";
import {InvalidArgumentError} from "../../Shared/domain/Errors/InvalidArgumentError";

type ProductputParams = {
    id: string;
};
type ProductPutBody = {
    name: string;
    stock: number;
};

@injectable()
export class ProductPutController{
    constructor(private readonly productCreator: ProductCreator) {

    }

    async run(
        req: Request <ProductputParams,unknown,ProductPutBody>,
        res: Response,
        next: NextFunction
    ): Promise<void>{
        // El body ahora es una instancia de ProductPutDto, ¡con tipos correctos!
        try{
            const id = req.params.id;
            const {name, stock} = req.body as ProductPutDto;

            if((req.body as any).id && (req.body as any).id !== req.params.id){
                throw new InvalidArgumentError(
                    `ID in body (${(req.body as any).id}) does not match ID in URL (${req.params.id})`
                );
            }
            await this.productCreator.run(id, name, stock);
            res.status(201).json({
                message: 'Product updated successfully'
            });
        }catch(error){
            next (error)
        }
    }
}
