import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFirestore } from "../contexts/FirestoreContext";
import { LockClosedIcon } from "@heroicons/react/20/solid";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRemeberMe] = useState(false);
	const { login } = useFirestore();

	useEffect(() => {
		document.title = `Sign In | Inventory Tracker`;
		if (localStorage.getItem("email") !== null) {
			setEmail(localStorage.getItem("email"));
			setRemeberMe(true);
		}
	}, []);

	async function handleSubmit(e) {
		e.preventDefault();
		await login(email, password, rememberMe);
	}

	return (
		<div className="flex items-center justify-center rounded-md py-12 px-4 sm:px-6 lg:px-8 bg-white">
			<div className="w-full max-w-md space-y-8">
				<div>
					<img className="mx-auto h-12 w-auto" src="/inventory-tracker-512x512.png" alt="Inventory Tracker" />
					<h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Don't have an account?
						<Link to="/signup" className="font-medium mx-1 text-indigo-600 hover:text-indigo-500">
							Create an account
						</Link>
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<input type="hidden" name="remember" defaultValue="true" />
					<div className="-space-y-px rounded-md shadow-sm">
						<div>
							<label htmlFor="email-address" className="sr-only">
								Email address
							</label>
							<input
								id="email-address"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
								placeholder="Email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<input
								id="remember-me"
								name="remember-me"
								type="checkbox"
								checked={rememberMe}
								onChange={(e) => setRemeberMe(e.target.checked)}
								className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
							/>
							<label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
								Remember me
							</label>
						</div>
					</div>

					<div>
						<button
							type="submit"
							className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
						>
							<span className="absolute inset-y-0 left-0 flex items-center pl-3">
								<LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
							</span>
							Sign in
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
