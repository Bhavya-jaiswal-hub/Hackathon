function InputForm() {
    return (
      <div className="p-4 bg-white shadow-md rounded-md">
        <h2 className="text-xl font-semibold mb-2">Enter Symptoms</h2>
        <input type="text" className="border p-2 w-full" placeholder="Type symptoms here..." />
        <button className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md">
          Check
        </button>
      </div>
    );
  }
  
  export default InputForm;
  
