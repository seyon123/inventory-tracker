import { collection, deleteDoc, doc, endBefore, getCountFromServer, getDoc, limit, limitToLast, onSnapshot, orderBy, query, setDoc, startAfter, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, TimeScale } from "chart.js";
import { Line } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import StoreItem from "../components/StoreItem";
import { db } from "../utilities/firebase";
import "chartjs-adapter-moment";
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon } from "@heroicons/react/24/outline";
import AddProductModal from "../modals/AddProductModal";
import { PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import { useFirestore } from "../contexts/FirestoreContext";
import toast from "react-hot-toast";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, TimeScale);
export const options = {
	responsive: true,
	scales: {
		x: {
			type: "time",
			time: {
				unit: "day",
			},
		},
	},
};

export default function ProductPage() {
	const { productId } = useParams();
	const [product, setProduct] = useState(null);

	const [inventory, setInventory] = useState();
	const [inventoryCount, setInventoryCount] = useState(null);
	const [inventoryPagination, setInventoryPagination] = useState(null);
	const [inventoryPage, setInventoryPage] = useState(1);

	const [inventoryHistory, setInventoryHistory] = useState();
	const [addProductModalOpen, setAddProductModalOpen] = useState(false);
	const [inWishlist, setInWishList] = useState(false);
	const { user } = useFirestore();

	useEffect(() => {
		async function getProductInfo() {
			const productInfo = await getDoc(doc(db, "products", productId));
			if (productInfo.exists()) {
				setProduct({ ...productInfo.data(), id: productInfo.id });
			}
		}
		getProductInfo();
	}, [productId, addProductModalOpen]);

	useEffect(() => {
		const unsubscribe = onSnapshot(query(collection(db, `inventory`), where("productRef", "==", doc(db, "products", productId)), limit(4)), (snapshot) => {
			setInventory(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
			setInventoryPagination({ first: snapshot.docs[0], last: snapshot.docs[snapshot.docs.length - 1] });
			setInventoryPage(1);
		});
		return () => {
			unsubscribe();
		};
	}, [productId]);

	useEffect(() => {
		async function getInventoryCount() {
			const inventoryCount_ = await getCountFromServer(query(collection(db, `inventory`), where("productRef", "==", doc(db, "products", productId))));
			setInventoryCount(inventoryCount_?.data().count);
		}
		getInventoryCount();
	}, [inventory, productId]);

	function handleInventoryPagination(direction) {
		if (direction === "next") {
			onSnapshot(query(collection(db, `inventory`), where("productRef", "==", doc(db, "products", productId)), startAfter(inventoryPagination?.last), limit(4)), (snapshot) => {
				setInventory(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
				setInventoryPagination({ first: snapshot.docs[0], last: snapshot.docs[snapshot.docs.length - 1] });
				setInventoryPage(inventoryPage + 1);
			});
		} else {
			onSnapshot(
				query(collection(db, `inventory`), where("productRef", "==", doc(db, "products", productId)), orderBy("productRef", "asc"), endBefore(inventoryPagination?.first), limitToLast(4)),
				(snapshot) => {
					setInventory(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
					setInventoryPagination({ first: snapshot.docs[0], last: snapshot.docs[snapshot.docs.length - 1] });
					setInventoryPage(inventoryPage - 1);
				}
			);
		}
	}

	useEffect(() => {
		const unsubscribe = onSnapshot(query(collection(db, `historical_inventory`), where("productRef", "==", doc(db, "products", productId))), (snapshot) => {
			setInventoryHistory(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
		});
		return () => {
			unsubscribe();
		};
	}, [productId]);

	useEffect(() => {
		document.title = `${product?.name} | Inventory Tracker`;
	}, [product]);

	async function handleAddToWishlist() {
		if (inWishlist) {
			await deleteDoc(doc(db, "users", user.id, "wishlist", productId));
			toast.success("Removed from wishlist successfully!");
			setInWishList(false);
		} else {
			await setDoc(doc(db, "users", user.id, "wishlist", productId), {
				productRef: doc(db, "products", productId),
			});
			toast.success("Added to wishlist successfully!");
			setInWishList(true);
		}
	}

	useEffect(() => {
		async function getWishlistInfo() {
			const productInfo = await getDoc(doc(db, `users/${user.id}/wishlist`, productId));
			if (productInfo.exists()) {
				setInWishList(true);
			}
		}
		getWishlistInfo();
	}, [user.id, productId]);

	return product ? (
		<div className="bg-white">
			<AddProductModal open={addProductModalOpen} setOpen={setAddProductModalOpen} product={product} />
			<div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-y-16 gap-x-8 py-24 px-4 sm:px-6 sm:py-32 lg:max-w-7xl lg:grid-cols-2 lg:px-8">
				<div>
					{user.isAdmin === true && (
						<button
							onClick={() => setAddProductModalOpen(true)}
							className="group relative flex justify-center rounded-full border border-transparent bg-indigo-600 p-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
						>
							<PencilIcon className="h-5 w-5 text-white group-hover:text-indigo-400" />
						</button>
					)}

					<h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{product?.name}</h2>

					{!product?.discontinued ? (
						inventory?.length > 0 && (
							<div className="mt-8">
								<h3 className="text-2xl font-medium text-gray-900">{`Lowest Price Available: $${inventory.sort((a, b) => (a.price > b.price ? 1 : -1))[0].price}`}</h3>
							</div>
						)
					) : (
						<div className="mt-8">
							<h3 className="text-2xl font-medium text-gray-900">DISCONTINUED</h3>
						</div>
					)}

					<p className="mt-4 text-gray-500" dangerouslySetInnerHTML={{ __html: product?.description.replace(/\n/g, "<br />") }}></p>
				</div>
				<div className="grid gap-4 sm:gap-6 lg:gap-8">
					<img src={product?.image} alt={product?.name} className="rounded-lg bg-gray-100 mx-auto" />
					<button
						onClick={() => handleAddToWishlist()}
						className="group relative flex justify-center rounded-full border border-transparent bg-indigo-600 p-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-700"
					>
						<span className="absolute inset-y-0 left-0 flex items-center pl-3">
							{inWishlist ? (
								<TrashIcon className="h-5 w-5 text-white group-hover:text-indigo-400 group-disabled:text-indigo-400" />
							) : (
								<PlusIcon className="h-5 w-5 text-white group-hover:text-indigo-400 group-disabled:text-indigo-400" />
							)}
						</span>
						<span className="hover:text-indigo-200">{inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}</span>
					</button>
				</div>
			</div>
			<div className="p-3 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				<h1 className=" text-2xl sm:text-3xl font-bold tracking-tight mb-2">Availability:</h1>
				{inventory?.length > 0 ? (
					<div className="mx-auto max-w-2xl py-8 px-4 sm:py-12 sm:px-6 lg:max-w-7xl lg:px-8">
						<div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
							{inventory?.map((item) => (
								<StoreItem inventoryItem={item} key={item?.id} />
							))}
						</div>
						<div className="flex items-center justify-between border-t border-gray-200 bg-white py-3 mt-3">
							<div className="flex flex-1 justify-between sm:hidden">
								<button
									className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:cursor-not-allowed"
									onClick={() => handleInventoryPagination("previous")}
									disabled={inventoryPage === 1}
								>
									<span className="sr-only">Previous</span>
									<ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
								</button>

								<button
									className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:cursor-not-allowed"
									onClick={() => handleInventoryPagination("next")}
									disabled={inventoryPage * 4 >= inventoryCount}
								>
									<span className="sr-only">Next</span>
									<ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
								</button>
							</div>
							<div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
								<div>
									<p className="text-sm text-gray-700">
										Showing <span className="font-medium">{inventoryPage * 4 - 3}</span> to <span className="font-medium">{Math.min(inventoryPage * 4, inventoryCount)}</span> of{" "}
										<span className="font-medium">{inventoryCount}</span> results
									</p>
								</div>
								<div>
									<nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
										<button
											className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:cursor-not-allowed"
											onClick={() => handleInventoryPagination("previous")}
											disabled={inventoryPage === 1}
										>
											<span className="sr-only">Previous</span>
											<ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
										</button>

										<button
											className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:cursor-not-allowed"
											onClick={() => handleInventoryPagination("next")}
											disabled={inventoryPage * 4 >= inventoryCount}
										>
											<span className="sr-only">Next</span>
											<ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
										</button>
									</nav>
								</div>
							</div>
						</div>
					</div>
				) : (
					<h1 className=" text-2xl font-bold tracking-tight mb-2 text-center">Product not available at any stores</h1>
				)}
			</div>
			<div className="p-3 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				<h1 className=" text-2xl sm:text-3xl font-bold tracking-tight mb-2">Price History:</h1>
				<div>
					<div className="mx-auto max-w-2xl py-8 px-4 sm:py-12 sm:px-6 lg:max-w-7xl lg:px-8"></div>
					<Line
						options={options}
						data={{
							labels: inventoryHistory?.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).map((item) => item?.timestamp.toDate()),
							datasets: [
								{
									label: "Price",
									data: inventoryHistory?.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).map((item) => item?.price),
									fill: false,
									borderColor: "#3333FF",
									backgroundColor: "#212F3D",
									pointBorderColor: "#B2BABB",
									pointBackgroundColor: "#3e3fca",
									pointHoverBackgroundColor: "#3e3fca",
									pointHoverBorderColor: "white",
									borderCapStyle: "butt",
									borderDash: [],
									borderDashOffset: 0.0,
									borderJoinStyle: "miter",
									pointBorderWidth: 1,
									pointHoverRadius: 5,
									pointHoverBorderWidth: 2,
									pointRadius: 3,
									pointHitRadius: 10,
								},
							],
						}}
					/>
				</div>
			</div>
		</div>
	) : (
		<div className="p-3 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center ">
			<h1 className=" text-2xl sm:text-3xl font-bold tracking-tight mb-2">Product Not Available</h1>
		</div>
	);
}
