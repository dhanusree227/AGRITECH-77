/**
 * Order state machine & permission validation.
 * Supports complete role-based workflow: requested -> accepted -> confirmed -> preparing -> ready -> in_transit -> delivered -> completed
 */

export type OrderStatus =
  | 'requested'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_dispatch'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'disputed';

export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface OrderTransitionRequest {
  currentStatus: OrderStatus;
  targetStatus: OrderStatus;
  userRole: UserRole;
  isBuyerOwner: boolean;
  isFarmerOwner: boolean;
}

export function isValidOrderTransition(req: OrderTransitionRequest): { allowed: boolean; reason?: string } {
  const { currentStatus, targetStatus, userRole, isBuyerOwner, isFarmerOwner } = req;

  // Admin can intervene in any state except already completed, or resolve dispute
  if (userRole === 'admin') {
    if (currentStatus === 'completed' && targetStatus !== 'completed') {
      return { allowed: false, reason: 'Completed orders cannot be transitioned backward by administrator.' };
    }
    return { allowed: true };
  }

  // Terminal states cannot be altered by buyer/farmer
  if (['completed', 'rejected', 'cancelled'].includes(currentStatus)) {
    return { allowed: false, reason: `Order is already in terminal state: ${currentStatus}` };
  }

  switch (currentStatus) {
    case 'requested':
      if (targetStatus === 'accepted' || targetStatus === 'rejected') {
        if (!isFarmerOwner) return { allowed: false, reason: 'Only the listing farmer can accept or reject this request.' };
        return { allowed: true };
      }
      if (targetStatus === 'cancelled') {
        if (!isBuyerOwner) return { allowed: false, reason: 'Only the requesting buyer can cancel a pending request.' };
        return { allowed: true };
      }
      return { allowed: false, reason: `Cannot transition requested to ${targetStatus}` };

    case 'accepted':
      if (targetStatus === 'confirmed') {
        if (!isBuyerOwner) return { allowed: false, reason: 'Only the buyer can confirm purchase terms.' };
        return { allowed: true };
      }
      if (targetStatus === 'cancelled') {
        if (!isBuyerOwner && !isFarmerOwner) return { allowed: false, reason: 'Unauthorized.' };
        return { allowed: true };
      }
      return { allowed: false, reason: `Cannot transition accepted to ${targetStatus}` };

    case 'confirmed':
      if (targetStatus === 'preparing') {
        if (!isFarmerOwner) return { allowed: false, reason: 'Only the farmer can mark produce as preparing.' };
        return { allowed: true };
      }
      return { allowed: false, reason: `Cannot transition confirmed to ${targetStatus}` };

    case 'preparing':
      if (targetStatus === 'ready_for_dispatch') {
        if (!isFarmerOwner) return { allowed: false, reason: 'Only the farmer can mark produce as ready for dispatch.' };
        return { allowed: true };
      }
      return { allowed: false, reason: `Cannot transition preparing to ${targetStatus}` };

    case 'ready_for_dispatch':
      if (targetStatus === 'in_transit') {
        if (!isFarmerOwner) return { allowed: false, reason: 'Only the fulfilling farmer can mark shipment in transit.' };
        return { allowed: true };
      }
      return { allowed: false, reason: `Cannot transition ready_for_dispatch to ${targetStatus}` };

    case 'in_transit':
      if (targetStatus === 'delivered') {
        if (!isBuyerOwner && !isFarmerOwner) return { allowed: false, reason: 'Unauthorized.' };
        return { allowed: true };
      }
      return { allowed: false, reason: `Cannot transition in_transit to ${targetStatus}` };

    case 'delivered':
      if (targetStatus === 'completed') {
        if (!isBuyerOwner) return { allowed: false, reason: 'Buyer must acknowledge inspection and complete the transaction.' };
        return { allowed: true };
      }
      if (targetStatus === 'disputed') {
        if (!isBuyerOwner) return { allowed: false, reason: 'Only buyer can raise quality dispute upon delivery.' };
        return { allowed: true };
      }
      return { allowed: false, reason: `Cannot transition delivered to ${targetStatus}` };

    case 'disputed':
      return { allowed: false, reason: 'Disputes can only be mediated by platform administrators.' };

    default:
      return { allowed: false, reason: 'Unknown state.' };
  }
}
