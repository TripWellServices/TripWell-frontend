border rounded p-2"
                    required
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addCity}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add Another City
            </button>
          </div>
        )}

        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={tripData.startDate}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">End Date</label>
            <input
              type="date"
              name="endDate"
              value={tripData.endDate}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          Let’s Go
        </button>
      </form>
    </div>
  );
}