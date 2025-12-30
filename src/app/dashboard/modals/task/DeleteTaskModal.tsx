import { Button } from "@pointwise/app/components/ui/Button";
import Container from "@pointwise/app/components/ui/Container";
import Modal from "@pointwise/app/components/ui/modal";
import { useDeleteTaskMutation } from "@pointwise/lib/redux/services/tasksApi";
import type { Task } from "@pointwise/lib/validation/tasks-schema";

export default function DeleteTaskModal({ task }: { task: Task }) {
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const handleDeleteTask = async () => {
    try {
      await deleteTask({ taskId: task.id }).unwrap();
      Modal.Manager.close(`delete-task-modal-${task.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal id={`delete-task-modal-${task.id}`} size="lg" loading={isDeleting}>
      <Modal.Header title="Delete Task" />
      <Modal.Body>
        <Container direction="vertical" gap="sm" className="items-stretch">
          <div className="px-4 py-3 bg-rose-500/10 border border-rose-400/20 rounded-lg">
            <p className="text-rose-400 text-sm font-medium mb-2">
              This action cannot be undone
            </p>
            <p className="text-zinc-400 text-sm">
              This will permanently delete the task and all associated content.
            </p>
          </div>
        </Container>
      </Modal.Body>
      <Modal.Footer align="end">
        <Button variant="secondary">Cancel</Button>
        <Button variant="danger" onClick={handleDeleteTask}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
