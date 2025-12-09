/**
 * Project Management Modal
 * 
 * Modal for creating and managing projects
 */

'use client';

import { useState } from 'react';
import { Modal } from '@pointwise/app/components/ui/Modal';
import { ModalHeader } from '@pointwise/app/components/ui/ModalHeader';
import { ModalBody } from '@pointwise/app/components/ui/ModalBody';
import { ModalFooter } from '@pointwise/app/components/ui/ModalFooter';
import { Button } from '@pointwise/app/components/ui/Button';
import { Input } from '@pointwise/app/components/ui/Input';
import { InputArea } from '@pointwise/app/components/ui/InputArea';

interface ProjectManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  projectId?: string;
  onProjectCreated?: (projectId: string) => void;
  onProjectUpdated?: (projectId: string) => void;
}

export function ProjectManagementModal({
  isOpen,
  onClose,
  mode,
  projectId,
  onProjectCreated,
  onProjectUpdated,
}: ProjectManagementModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'create') {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
            visibility,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create project');
        }

        const data = await response.json();
        onProjectCreated?.(data.project.id);
        onClose();
      } else {
        // Edit mode
        if (!projectId) throw new Error('Project ID required for edit');

        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
            visibility,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update project');
        }

        onProjectUpdated?.(projectId);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={onClose}>
          {mode === 'create' ? 'Create New Project' : 'Edit Project'}
        </ModalHeader>

        <ModalBody>
          <div className="space-y-5">
            {error && (
              <div className="px-4 py-3 bg-rose-500/10 border border-rose-400/20 rounded-lg text-rose-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Project Name"
              placeholder="My Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              fullWidth
            />

            <InputArea
              label="Description"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              fullWidth
            />

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">
                Visibility
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('PRIVATE')}
                  className={`px-4 py-3 rounded-xl border transition-colors ${
                    visibility === 'PRIVATE'
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                      : 'bg-zinc-800/50 border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="font-medium">Private</span>
                  </div>
                  <div className="text-xs mt-1 text-zinc-500">Invite only</div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('PUBLIC')}
                  className={`px-4 py-3 rounded-xl border transition-colors ${
                    visibility === 'PUBLIC'
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                      : 'bg-zinc-800/50 border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">Public</span>
                  </div>
                  <div className="text-xs mt-1 text-zinc-500">Anyone can request</div>
                </button>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            loading={isSubmitting}
          >
            {mode === 'create' ? 'Create Project' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

