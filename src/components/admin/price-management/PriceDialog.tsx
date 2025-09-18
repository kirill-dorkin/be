'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';
import { IService } from '@/models/Service';
import { IProduct } from '@/models/Product';
import { PriceItemType } from './types';

interface PriceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: IService | IProduct | null;
  selectedItemType: PriceItemType;
  priceFormData: {
    newPrice: number;
    reason: string;
  };
  setPriceFormData: (data: { newPrice: number; reason: string }) => void;
  onUpdatePrice: () => void;
}

export const PriceDialog = ({
  isOpen,
  onClose,
  selectedItem,
  selectedItemType,
  priceFormData,
  setPriceFormData,
  onUpdatePrice,
}: PriceDialogProps) => {
  const getCurrentPrice = () => {
    if (!selectedItem) return 0;
    return selectedItemType === 'service' 
      ? (selectedItem as IService).cost 
      : (selectedItem as IProduct).price;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Обновить цену</DialogTitle>
          <DialogDescription>
            Обновите цену для {selectedItemType === 'service' ? 'услуги' : 'товара'} "{selectedItem?.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="current-price" className="text-right">Текущая цена</Label>
            <div className="col-span-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-lg font-semibold">
                {getCurrentPrice()?.toLocaleString('ru-RU') || 0} ₽
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-price" className="text-right">Новая цена</Label>
            <Input
              id="new-price"
              type="number"
              value={priceFormData.newPrice}
              onChange={(e) => setPriceFormData({ 
                ...priceFormData, 
                newPrice: Number(e.target.value) 
              })}
              className="col-span-3"
              placeholder="Введите новую цену"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">Причина</Label>
            <Input
              id="reason"
              value={priceFormData.reason}
              onChange={(e) => setPriceFormData({ 
                ...priceFormData, 
                reason: e.target.value 
              })}
              className="col-span-3"
              placeholder="Причина изменения цены (необязательно)"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button onClick={onUpdatePrice}>
            Обновить цену
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};