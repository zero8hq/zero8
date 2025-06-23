"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function ApiKeysPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [keyToDelete, setKeyToDelete] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/keys");
      if (!response.ok) throw new Error("Failed to fetch API keys");
      const data = await response.json();
      setApiKeys(data.apiKeys || []);
    } catch (error) {
      toast.error("Failed to load API keys");
      console.error("Error fetching API keys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await fetch("/api/keys/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName || "Key-ZER08" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create API key");
      }

      const data = await response.json();
      setNewlyCreatedKey(data.apiKey);

      // Add the new key to the list immediately
      const newKey = {
        id: Date.now(),
        name: data.name,
        last_four: data.lastFour,
        created_at: new Date().toISOString(),
        is_active: true,
        last_used: null,
      };
      setApiKeys((prev) => [newKey, ...prev]);

      setNewKeyName("");
      toast.success("API key created successfully!");
      fetchApiKeys();
    } catch (error) {
      toast.error(error.message || "Failed to create API key");
      console.error("Error creating API key:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text, keyId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const deleteApiKey = async (keyId) => {
    if (!keyId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/keys/delete?id=${keyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete API key");
      }

      // Remove the key from the local state
      setApiKeys((prev) => prev.filter((key) => key.id !== keyId));
      toast.success("API key deleted successfully");
      setKeyToDelete(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete API key");
      console.error("Error deleting API key:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderNewKeyModal = () => {
    if (!newlyCreatedKey) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#1a1a1a] rounded-lg shadow-xl max-w-md w-full mx-4 border border-[#333333]/50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center bg-green-500/10 px-3 py-1.5 rounded-md border border-green-500/20">
                <svg
                  className="w-4 h-4 text-green-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-green-400">
                  API Key Created
                </span>
              </div>
              <button
                onClick={() => setNewlyCreatedKey(null)}
                className="cursor-pointer text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-gray-400 mb-4 text-sm">
              Copy your API key now. For security reasons, you won&apos;t be
              able to see it again.
            </p>
            <div className="bg-[#222222] p-4 rounded-md font-mono text-sm text-gray-300 break-all select-all mb-6 border border-[#333333]/50">
              {newlyCreatedKey}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newlyCreatedKey);
                  toast.success("API key copied to clipboard!");
                  const button = document.activeElement;
                  if (button) {
                    // Change button text temporarily
                    const originalText = button.innerText;
                    button.innerText = "Copied!";
                    button.classList.add(
                      "bg-gradient-to-r",
                      "from-green-500",
                      "to-green-600"
                    );
                    button.classList.remove("from-blue-500", "to-purple-600");

                    // Reset button after 1.5 seconds
                    setTimeout(() => {
                      button.innerText = originalText;
                      button.classList.remove("from-green-500", "to-green-600");
                      button.classList.add("from-blue-500", "to-purple-600");
                    }, 1500);
                  }
                }}
                className="cursor-pointer mr-4 px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#1a1a1a]"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setNewlyCreatedKey(null)}
                className="cursor-pointer px-4 py-2 rounded-md text-sm font-medium bg-[#222222] text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-all duration-300 border border-[#333333]/50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteConfirmation = () => {
    if (!keyToDelete) return null;

    const keyData = apiKeys.find((key) => key.id === keyToDelete);
    if (!keyData) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#1a1a1a] rounded-lg shadow-xl max-w-md w-full mx-4 border border-[#333333]/50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center bg-red-500/10 px-3 py-1.5 rounded-md border border-red-500/20">
                <svg
                  className="w-4 h-4 text-red-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span className="text-sm font-medium text-red-400">
                  Delete API Key
                </span>
              </div>
              <button
                onClick={() => setKeyToDelete(null)}
                className="cursor-pointer text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-gray-400 mb-2 text-sm">
              Are you sure you want to delete this API key?
            </p>
            <div className="bg-[#222222] p-3 rounded-md mb-6 border border-[#333333]/50">
              <div className="flex items-center">
                <span className="text-white font-medium w-1/3 ml-3">
                  {keyData.name}
                </span>
                <span className="font-mono text-sm text-gray-400">
                  •••• {keyData.last_four}
                </span>
              </div>
            </div>
            <p className="text-red-400 text-sm mb-6">
              This action cannot be undone. All applications using this key will
              no longer be able to access the API.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setKeyToDelete(null)}
                className="cursor-pointer mr-2 px-4 py-2 rounded-md text-sm font-medium bg-[#222222] text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-all duration-300 border border-[#333333]/50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteApiKey(keyToDelete)}
                className="cursor-pointer px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-[#1a1a1a]"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </div>
                ) : (
                  "Delete API Key"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-20 h-full bg-[#111111] text-white">
      {renderNewKeyModal()}
      {renderDeleteConfirmation()}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <h1 className="text-2xl font-semibold text-white">API Keys</h1>
            <span className="ml-3 px-2.5 py-1 text-xs font-medium bg-[#222222] text-gray-300 rounded-md border border-[#333333]/50">
              {apiKeys.length} {apiKeys.length === 1 ? "key" : "keys"}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-gray-600">/</span>
            <span className="px-3 py-1.5 text-sm text-white">API Keys</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create new API key section */}
          <div className="bg-[#1a1a1a] border border-[#333333]/50 rounded-lg p-5 lg:col-span-1 h-fit">
            <h2 className="text-lg font-medium text-white mb-4">
              Create New API Key
            </h2>
            <form onSubmit={createApiKey} className="space-y-4">
              <div>
                <label
                  htmlFor="keyName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Key Name
                </label>
                <input
                  type="text"
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                  className="w-full px-4 py-2 bg-[#222222] border border-[#333333]/50 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className={`w-full px-4 py-2 mt-4 rounded-md text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 ${
                  isCreating ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isCreating ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </div>
                ) : (
                  "Create API Key"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#333333]/50">
              <h3 className="text-sm font-medium text-white mb-2">
                About API Keys
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                API keys are used to authenticate your requests to the ZER08
                API. Keep your keys secure and never share them publicly.
              </p>
              <Link
                href="/docs/api-keys"
                className="text-xs flex items-center text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Learn more about API keys
              </Link>
            </div>
          </div>

          {/* API keys list */}
          <div className="bg-[#1a1a1a] border border-[#333333]/50 rounded-lg overflow-hidden lg:col-span-2">
            <div className="px-5 py-4 border-b border-[#333333]/50">
              <h2 className="text-lg font-medium text-white">Your API Keys</h2>
            </div>

            {isLoading ? (
              <div className="p-5 divide-y divide-[#333333]/50">
                {[1, 2].map((i) => (
                  <div key={i} className="p-5 animate-pulse">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      {/* Left Section */}
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="h-9 w-9 rounded-md bg-[#222222] border border-[#333333]/30"></div>
                        <div>
                          <div className="h-5 w-32 bg-[#222222] rounded mb-2"></div>
                          <div className="h-4 w-24 bg-[#222222] rounded"></div>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex items-center gap-3 mt-2 sm:mt-0">
                        <div className="h-6 w-16 bg-[#222222] rounded-full"></div>
                        <div className="h-8 w-8 bg-[#222222] rounded-md"></div>
                      </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-[#222222] rounded-full"></div>
                        <div className="h-3 w-full bg-[#222222] rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-[#222222] rounded-full"></div>
                        <div className="h-3 w-full bg-[#222222] rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-[#222222] rounded-full"></div>
                        <div className="h-3 w-full bg-[#222222] rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <svg
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-white mb-2">
                  No API Keys Found
                </h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Create your first API key to start making authenticated
                  requests to the ZER08 API.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#333333]/50">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="p-5 hover:bg-[#222222] transition-colors duration-300 rounded-lg shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="p-2 bg-[#222222] rounded-md border border-[#333333]/50">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-white">
                            {key.name}
                          </h3>
                          <span className="font-mono text-sm text-gray-400 block mt-1">
                            •••• {key.last_four}
                          </span>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex items-center gap-3 mt-2 sm:mt-0">
                        {key.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            Inactive
                          </span>
                        )}
                        <button
                          onClick={() => setKeyToDelete(key.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete API Key"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 mt-4 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="mt-[1px] truncate">
                          Created:{" "}
                          {new Date(key.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="truncate">
                          Last used:{" "}
                          {key.last_used
                            ? new Date(key.last_used).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "Never"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        <span className="mt-[1px]">
                          Permissions: Read & Write
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
