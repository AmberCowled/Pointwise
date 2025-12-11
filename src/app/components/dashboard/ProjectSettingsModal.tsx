/**
 * Project Settings Modal
 *
 * Modal for editing and deleting projects
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@pointwise/app/components/ui/Modal';
import { ModalHeader } from '@pointwise/app/components/ui/ModalHeader';
import { ModalBody } from '@pointwise/app/components/ui/ModalBody';
import { ModalFooter } from '@pointwise/app/components/ui/ModalFooter';
import { Button } from '@pointwise/app/components/ui/Button';
import { Input } from '@pointwise/app/components/ui/Input';
import { InputArea } from '@pointwise/app/components/ui/InputArea';
import {
  useDeleteProjectMutation,
  useGetProjectQuery,
  useUpdateProjectMutation,
} from '@pointwise/lib/redux/services/projectsApi';

// Helper to extract error message from RTK Query error
function getErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (typeof error === 'object' && 'data' in error) {
    const data = error.data;
    if (typeof data === 'object' && data && 'error' in data) {
      return String(data.error);
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  onProjectUpdated?: () => void;
  onProjectDeleted?: () => void;
}

export function ProjectSettingsModal({
  isOpen,
  onClose,
  projectId,
  onProjectUpdated,
  onProjectDeleted,
}: ProjectSettingsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // RTK Query hooks
  const {
    data: projectData,
    isLoading: isLoadingProject,
    error: projectError,
  } = useGetProjectQuery(projectId || '', {
    skip: !isOpen || !projectId,
  });

  const [updateProject, { isLoading: isUpdating, error: updateError }] =
    useUpdateProjectMutation();
  const [deleteProject, { isLoading: isDeleting, error: deleteError }] =
    useDeleteProjectMutation();

  // Use query data as source of truth
  const project = projectData?.project;
  
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');
  
  // Sync query data to form when it loads
  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setVisibility(project.visibility);
    }
  }, [project]);
  
  const isLoading = isLoadingProject || isUpdating;
  const error = updateError || deleteError || projectError;
  const errorMessage = error
    ? getErrorMessage(error, 'An error occurred')
    : null;

  const handleClose = () => {
    // Reset form state when closing
    setName('');
    setDescription('');
    setVisibility('PRIVATE');
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId || !name.trim()) return;

    try {
      await updateProject({
        projectId,
        data: {
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
        },
      }).unwrap();

      onProjectUpdated?.();
      handleClose();
    } catch (err) {
      // Error is already in updateError, will be displayed
      console.error('Failed to update project:', err);
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;

    if (deleteConfirmText !== name.trim()) {
      // Validation error - show inline
      return;
    }

    try {
      await deleteProject(projectId).unwrap();

      onProjectDeleted?.();
      handleClose();
    } catch (err) {
      // Error is already in deleteError, will be displayed
      console.error('Failed to delete project:', err);
    }
  };

  if (!projectId) return null;

  return (
    <Modal open={isOpen} onClose={handleClose} size="lg">
      {showDeleteConfirm ? (
        // Delete confirmation view
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDelete();
          }}
        >
          <ModalHeader onClose={handleClose}>Delete Project</ModalHeader>

          <ModalBody>
            <div className="space-y-5">
              {errorMessage && (
                <div className="px-4 py-3 bg-rose-500/10 border border-rose-400/20 rounded-lg text-rose-400 text-sm">
                  {errorMessage}
                </div>
              )}
              {deleteConfirmText !== name.trim() && deleteConfirmText && (
                <div className="px-4 py-3 bg-rose-500/10 border border-rose-400/20 rounded-lg text-rose-400 text-sm">
                  Project name does not match
                </div>
              )}

              <div className="px-4 py-3 bg-rose-500/10 border border-rose-400/20 rounded-lg">
                <p className="text-rose-400 text-sm font-medium mb-2">
                  This action cannot be undone
                </p>
                <p className="text-zinc-400 text-sm">
                  This will permanently delete the project and all associated
                  tasks. All members will lose access to this project.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Type the project name{' '}
                  <span className="font-semibold">{name}</span> to confirm
                  deletion:
                </label>
                <Input
                  placeholder={name}
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  fullWidth
                  autoFocus
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteConfirmText('');
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={isDeleting || deleteConfirmText !== name.trim()}
              loading={isDeleting}
            >
              Delete Project
            </Button>
          </ModalFooter>
        </form>
      ) : (
        // Edit view
        <form onSubmit={handleSubmit}>
          <ModalHeader onClose={handleClose}>Project Settings</ModalHeader>

          <ModalBody>
            <div className="space-y-5">
              {errorMessage && (
                <div className="px-4 py-3 bg-rose-500/10 border border-rose-400/20 rounded-lg text-rose-400 text-sm">
                  {errorMessage}
                </div>
              )}

              {isLoading && !name ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                  <p className="text-sm text-zinc-400 mt-4">
                    Loading project...
                  </p>
                </div>
              ) : (
                <>
                  <Input
                    label="Project Name"
                    placeholder="My Project"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                    fullWidth
                    disabled={isLoading}
                  />

                  <InputArea
                    label="Description"
                    placeholder="What is this project about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={500}
                    fullWidth
                    disabled={isLoading}
                  />

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-3">
                      Visibility
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setVisibility('PRIVATE')}
                        disabled={isLoading}
                        className={`px-4 py-3 rounded-xl border transition-colors ${
                          visibility === 'PRIVATE'
                            ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                            : 'bg-zinc-800/50 border-white/10 text-zinc-400 hover:border-white/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          <span className="font-medium">Private</span>
                        </div>
                        <div className="text-xs mt-1 text-zinc-500">
                          Invite only
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisibility('PUBLIC')}
                        disabled={isLoading}
                        className={`px-4 py-3 rounded-xl border transition-colors ${
                          visibility === 'PUBLIC'
                            ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                            : 'bg-zinc-800/50 border-white/10 text-zinc-400 hover:border-white/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="font-medium">Public</span>
                        </div>
                        <div className="text-xs mt-1 text-zinc-500">
                          Anyone can request
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading || !name}
              className="mr-auto"
            >
              Delete Project
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading || isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              loading={isLoading}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
}
