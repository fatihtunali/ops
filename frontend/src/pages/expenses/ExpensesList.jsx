import { useState, useEffect } from 'react';
import MainLayout from '@components/layout/MainLayout';
import { Card, Button, Badge } from '@components/common';
import {
  PlusIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

const ExpensesList = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Operational Expenses</h1>
            <p className="text-gray-600 mt-1">Track company operational expenses</p>
          </div>
          <Button icon={PlusIcon}>Add Expense</Button>
        </div>

        <Card>
          <div className="text-center py-12">
            <BanknotesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Expenses Management</h3>
            <p className="text-gray-600">Coming soon - Expense tracking functionality</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ExpensesList;
