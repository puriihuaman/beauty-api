import type { ICatalogModel } from "../../domain/model/index.ts";
import type { ICatalogRequest } from "../../dto/index.ts";

export interface ICatalogRepository {
	findById(id: ICatalogModel["id"]): Promise<ICatalogModel | null>;
	findAll(includeArchived?: boolean): Promise<ICatalogModel[]>;
	findByName(name: ICatalogRequest["name"]): Promise<ICatalogModel | null>;
	save(catalog: ICatalogRequest): Promise<ICatalogModel>;
	update(
		id: ICatalogModel["id"],
		catalog: Partial<ICatalogRequest>
	): Promise<void>;
	delete(id: ICatalogModel["id"]): Promise<void>;
	count(includeArchived?: boolean): Promise<number>;
}
