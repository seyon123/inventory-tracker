import React, { Fragment, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function AddProductModal({ open, setOpen }) {
	const [name, setName] = useState("");
	const [upc, setUpc] = useState("");
	const [description, setDescription] = useState("");
	const cancelButtonRef = useRef(null);

	function handleSave() {
		"";
	}

	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
				<Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
				</Transition.Child>

				<div className="fixed inset-0 z-10 overflow-y-auto">
					<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							enterTo="opacity-100 translate-y-0 sm:scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						>
							<Dialog.Panel className="relative w-full transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
								<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
									<div className="mt-3 text-center sm:mt-0 sm:text-left">
										<Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
											Add Product
										</Dialog.Title>
										<div className="mt-2">
											<p className="text-sm text-gray-500">Add a Product to the database</p>
										</div>
										<form>
											<div className="my-2">
												<input id="productImage" type="file" />
											</div>
											<div className="my-2">
												<label htmlFor="upc" className="block text-sm font-medium text-gray-700">
													UPC Code
												</label>
												<input
													id="upc"
													type="text"
													className="block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													value={upc}
													onChange={(e) => setUpc(e.target.value)}
												/>
											</div>
											<div className="my-2">
												<label htmlFor="name" className="block text-sm font-medium text-gray-700">
													Name
												</label>
												<input
													id="name"
													type="text"
													className="block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													value={name}
													onChange={(e) => setName(e.target.value)}
												/>
											</div>
											<div className="my-2">
												<label htmlFor="description" className="block text-sm font-medium text-gray-700">
													Description
												</label>
												<textarea
													id="name"
													type="text"
													className="block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
													value={description}
													onChange={(e) => setDescription(e.target.value)}
												/>
											</div>
										</form>
									</div>
								</div>
								<div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
									<button
										type="button"
										className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
										onClick={() => handleSave()}
									>
										Save
									</button>
									<button
										type="button"
										className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
										onClick={() => setOpen(false)}
										ref={cancelButtonRef}
									>
										Cancel
									</button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
}
