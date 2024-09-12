"use client";

import { useEffect, useState } from "react";
import { useRequestMutation } from "./_http/axiosFetcher";
import { CheckStatus } from "./_utils/CheckStatus";
import clsx from "clsx";
import { toast } from "react-toastify";

export default function Home() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
  });
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const {
    data,
    trigger: loadData,
    isMutating: isLoading,
    error,
  } = useRequestMutation("todos", {
    method: "GET",
    module: "devApi",
  });
  const {
    trigger,
    isMutating,
    error: createTodoError,
  } = useRequestMutation("todos", {
    method: "POST",
    module: "devApi",
  });
  const {
    trigger: deleteTodo,
    isMutating: deleteMutating,
    error: DeleteError,
  } = useRequestMutation("deletetodo", {
    method: "DELETE",
    module: "devApi",
  });
  const handleDelete = async (id: any) => {
    try {
      await deleteTodo({
        dynamicValue: id,
      }).then((res) => {
        loadData();
      });
      toast.success("Delete successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await trigger({
        body: form,
      }).then((res) => {
        loadData();
        toast.success(res.message);
        Object.keys(form).map((key) => {
          setForm((prev) => ({ ...prev, [key]: "" }));
        });
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  if (error) {
    return (
      <button className="bg-red-100 text-red-600 rounded-md p-2">
        {error.message as string}
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        {" "}
        <div className="border-gray-300 h-12 w-12 animate-spin rounded-full border-4 border-t-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="max-w-[500px] mx-auto my-5">
        <form className="flex flex-col gap-5 ">
          <input
            className="p-3 rounded-md w-full border-2 border-gray-300 outline-none "
            type="text"
            placeholder="Title"
            name="title"
            onChange={handleChange}
            value={form.title}
          />
          <input
            className="p-3 rounded-md w-full border-2 border-gray-300 outline-none "
            type="text"
            placeholder="Description"
            name="description"
            onChange={handleChange}
            value={form.description}
          />
          <select
            className="p-3 rounded-md w-full outline-none border-2 border-gray-300"
            name="status"
            id="status"
            onChange={handleChange}
            value={form.status}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button
            disabled={isMutating}
            className="bg-green-100 flex justify-center items-center disabled:bg-gray-300 disabled:cursor-not-allowed w-full text-green-600 rounded-md p-2"
            type="submit"
            onClick={handleSubmit}
          >
            {isMutating ? (
              <div className="border-gray-300 h-6 w-6 animate-spin rounded-full border-2 border-t-blue-600" />
            ) : (
              "Create"
            )}
          </button>
        </form>
      </div>
      {DeleteError && (
        <button className="bg-red-100 text-red-600 rounded-md p-2">
          {DeleteError.message as string}
        </button>
      )}
      {data?.data?.length === 0 && (
        <div className="flex p-3 rounded-md bg-blue-100 text-blue-500 justify-center items-center">
          <h1 className="text-xl font-bold">No data</h1>
        </div>
      )}
      <div className="flex flex-row my-5 justify-center flex-wrap gap-4">
        {data &&
          data?.data?.map((todo: any, idx: number) => (
            <div
              className="max-w-[300px] p-4 w-full shadow-lg rounded-md bg-white"
              key={idx}
            >
              <h1 className="text-md font-bold max-w-[200px] line-clamp-2 ">
                {todo.title}
              </h1>
              <p className="text-sm max-w-[300px]">{todo.description}</p>
              <div className="flex justify-start items-center gap-2">
                <button
                  className={clsx(
                    "p-3  my-3 rounded-md",
                    CheckStatus(todo.status)
                  )}
                >
                  {todo.status}
                </button>
                <button
                  onClick={() => handleDelete(todo?._id)}
                  disabled={deleteMutating}
                  className="bg-red-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-red-600 rounded-md p-3"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
