export default function About() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">
          About Fresh Groceries
        </h1>
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-4 text-lg">
            Fresh Groceries is your one-stop online grocery store, built with cutting-edge technology 
            to provide you with the best shopping experience.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-gray-800">
            Features
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Browse products by category</li>
            <li>Search for specific items</li>
            <li>Add items to shopping cart</li>
            <li>Secure checkout process</li>
            <li>Fast and responsive design</li>
            <li>Product ratings and reviews</li>
          </ul>
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-gray-800">
            Tech Stack
          </h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800">Frontend</h3>
              <p className="text-sm text-gray-600">React 18, Next.js 16</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Backend</h3>
              <p className="text-sm text-gray-600">Next.js API Routes</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800">Styling</h3>
              <p className="text-sm text-gray-600">Tailwind CSS</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-800">Language</h3>
              <p className="text-sm text-gray-600">TypeScript</p>
            </div>
          </div>
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Our Mission</h3>
            <p className="text-gray-600">
              To make grocery shopping convenient, fast, and enjoyable for everyone. 
              We're committed to providing fresh products and excellent service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

