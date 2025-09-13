import type { IClientModel } from "../../domain/model/index.ts";
import type { IClientRequest } from "../../dto/index.ts";

export interface IClientRepository {
	findById(id: IClientModel["id"]): Promise<IClientModel | null>;
	findAll(includeArchived?: boolean): Promise<IClientModel[]>;
	findByName(name: IClientModel["name"]): Promise<IClientModel | null>;
	save(client: IClientRequest): Promise<IClientModel>;
	update(
		id: IClientModel["id"],
		client: Partial<IClientRequest>
	): Promise<void>;
	delete(id: IClientModel["id"]): Promise<void>;
	count(includeArchived?: boolean): Promise<number>;
}
