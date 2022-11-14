import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StoreItem from "../components/StoreItem";
import { db } from "../utilities/firebase";

export default function ProductPage() {
	const { productId } = useParams();
	const [product, setProduct] = useState();
	const [inventory, setInventory] = useState();

	const features = [
		{ name: "Origin", description: "Designed by Good Goods, Inc." },
		{ name: "Material", description: "Solid walnut base with rare earth magnets and powder coated steel card cover" },
		{ name: "Dimensions", description: '6.25" x 3.55" x 1.15"' },
		{ name: "Finish", description: "Hand sanded and finished with natural oil" },
		{ name: "Includes", description: "Wood card tray and 3 refill packs" },
		{ name: "Considerations", description: "Made from natural materials. Grain and color vary with each item." },
	];

	useEffect(() => {
		async function getProductInfo() {
			const productInfo = await getDoc(doc(db, "products", productId));
			setProduct({ ...productInfo.data(), id: productInfo.id });
		}
		getProductInfo();
	}, [productId]);

	useEffect(() => {
		const unsubscribe = onSnapshot(query(collection(db, `inventory`), where("productRef", "==", doc(db, "products", productId), orderBy("price"))), (snapshot) => {
			setInventory(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
		});
		return () => {
			unsubscribe();
		};
	}, [productId]);

	useEffect(() => {
		document.title = `${product?.name} | Inventory Tracker`;
	}, [product]);

	return (
		<div className="bg-white">
			{console.log(inventory)}
			<div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-y-16 gap-x-8 py-24 px-4 sm:px-6 sm:py-32 lg:max-w-7xl lg:grid-cols-2 lg:px-8">
				<div>
					<h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{product?.name}</h2>
					<p className="mt-4 text-gray-500">{product?.description}</p>

					<dl className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
						{features.map((feature) => (
							<div key={feature.name} className="border-t border-gray-200 pt-4">
								<dt className="font-medium text-gray-900">{feature.name}</dt>
								<dd className="mt-2 text-sm text-gray-500">{feature.description}</dd>
							</div>
						))}
					</dl>

					{inventory?.length > 0 && (
						<div className="mt-8">
							<h3 className="text-2xl font-medium text-gray-900">{`Lowest Price Available: $${inventory[0].price}`}</h3>
						</div>
					)}
				</div>
				<div className="grid gap-4 sm:gap-6 lg:gap-8">
					<img src={product?.image} alt={product?.name} className="rounded-lg bg-gray-100" />
				</div>
			</div>

			<div className="p-3 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center ">
				<h1 className=" text-2xl sm:text-3xl font-bold tracking-tight mb-2">Availability:</h1>
				<div>
					<div className="mx-auto max-w-2xl py-8 px-4 sm:py-12 sm:px-6 lg:max-w-7xl lg:px-8">
						<div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
							{inventory?.map((item) => (
								<StoreItem inventoryItem={item} key={item?.id} />
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}