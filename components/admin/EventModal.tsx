"use client";

import React from "react";

interface EventModalProps {
    formData: any;
    setFormData: (data: any) => void;
    handleSaveEvent: (e: React.FormEvent) => void;
    setShowModal: (open: boolean) => void;
    editMode: boolean;
    uploading: boolean;
    setBannerFile: (file: File | null) => void;
}

export default function EventModal({
                                       formData,
                                       setFormData,
                                       handleSaveEvent,
                                       setShowModal,
                                       editMode,
                                       uploading,
                                       setBannerFile,
                                   }: EventModalProps) {
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4 text-emerald-400">
                    {editMode ? "Edit Event" : "Add New Event"}
                </h2>

                <form onSubmit={handleSaveEvent} className="space-y-4">
                    <input
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-2 rounded bg-gray-700 text-white"
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                        className="w-full p-2 rounded bg-gray-700 text-white"
                    />
                    <input
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full p-2 rounded bg-gray-700 text-white"
                    />
                    <input
                        name="location"
                        placeholder="Location"
                        value={formData.location}
                        onChange={(e) =>
                            setFormData({ ...formData, location: e.target.value })
                        }
                        className="w-full p-2 rounded bg-gray-700 text-white"
                    />
                    <input
                        name="price"
                        type="number"
                        placeholder="Price"
                        value={formData.price}
                        onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                        }
                        className="w-full p-2 rounded bg-gray-700 text-white"
                    />

                    {/* Banner Upload */}
                    <div>
                        <label className="block mb-2 text-sm text-gray-400">
                            Event Banner
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setBannerFile(e.target.files ? e.target.files[0] : null)
                            }
                            className="w-full p-2 bg-gray-700 rounded"
                        />
                        {uploading && (
                            <p className="text-xs text-yellow-400 mt-2">Uploading...</p>
                        )}
                        {formData.bannerUrl && !uploading && (
                            <img
                                src={formData.bannerUrl}
                                alt="Banner preview"
                                className="mt-3 rounded-lg max-h-40 object-cover"
                            />
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 bg-gray-600 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg"
                        >
                            {uploading ? "Uploading..." : editMode ? "Update" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
