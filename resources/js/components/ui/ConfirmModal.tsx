import * as React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary' | 'warning';
    isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    isLoading = false,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4 py-1">
                <p className="text-xs text-text-secondary leading-relaxed">
                    {message}
                </p>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-xs font-bold"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        size="sm"
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className="text-xs font-bold px-4"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
