{/* Nav prompt block */}
<div className="mt-8 space-y-4 text-center">
  <p className="text-lg font-semibold">
    Ready to plan the rest of your trip?
  </p>

  <button
    onClick={() => navigate(`/tripwell/tripintent/${trip._id}`)}
    className="mx-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition"
  >
    Yes! Let’s Go
  </button>

  <div className="mt-4">
    <button
      onClick={() => navigate("/tripwell/home")}
      className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
    >
      🏠 Head Home
    </button>
  </div>
</div>
