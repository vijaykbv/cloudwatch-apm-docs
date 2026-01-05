import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CostOptimizationCenter } from '../CostOptimizationCenter';

// Mock the child components
jest.mock('../CostOptimizationGuide', () => ({
  CostOptimizationGuide: () => <div data-testid="cost-optimization-guide">Cost Optimization Guide</div>
}));

jest.mock('../CostCalculator', () => ({
  CostCalculator: () => <div data-testid="cost-calculator">Cost Calculator</div>
}));

jest.mock('../CostTroubleshootingGuide', () => ({
  CostTroubleshootingGuide: () => <div data-testid="cost-troubleshooting-guide">Cost Troubleshooting Guide</div>
}));

describe('CostOptimizationCenter', () => {
  it('renders the main title and description', () => {
    render(<CostOptimizationCenter />);
    
    expect(screen.getByText('💰 APM Cost Optimization')).toBeInTheDocument();
    expect(screen.getByText('Maximize observability while minimizing costs with smart optimization strategies')).toBeInTheDocument();
  });

  it('renders all tab navigation options', () => {
    render(<CostOptimizationCenter />);
    
    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('Optimization Guide')).toBeInTheDocument();
    expect(screen.getByText('🧮')).toBeInTheDocument();
    expect(screen.getByText('Cost Calculator')).toBeInTheDocument();
    expect(screen.getByText('🔧')).toBeInTheDocument();
    expect(screen.getByText('Cost Troubleshooting')).toBeInTheDocument();
  });

  it('shows the optimization guide by default', () => {
    render(<CostOptimizationCenter />);
    
    expect(screen.getByTestId('cost-optimization-guide')).toBeInTheDocument();
    expect(screen.queryByTestId('cost-calculator')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cost-troubleshooting-guide')).not.toBeInTheDocument();
  });

  it('switches to cost calculator when tab is clicked', () => {
    render(<CostOptimizationCenter />);
    
    const calculatorTab = screen.getByText('Cost Calculator');
    fireEvent.click(calculatorTab);
    
    expect(screen.getByTestId('cost-calculator')).toBeInTheDocument();
    expect(screen.queryByTestId('cost-optimization-guide')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cost-troubleshooting-guide')).not.toBeInTheDocument();
  });

  it('switches to troubleshooting guide when tab is clicked', () => {
    render(<CostOptimizationCenter />);
    
    const troubleshootingTab = screen.getByText('Cost Troubleshooting');
    fireEvent.click(troubleshootingTab);
    
    expect(screen.getByTestId('cost-troubleshooting-guide')).toBeInTheDocument();
    expect(screen.queryByTestId('cost-optimization-guide')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cost-calculator')).not.toBeInTheDocument();
  });

  it('applies active tab styling correctly', () => {
    render(<CostOptimizationCenter />);
    
    const guideTab = screen.getByText('Optimization Guide');
    const calculatorTab = screen.getByText('Cost Calculator');
    
    // Guide tab should be active by default
    expect(guideTab.closest('button')).toHaveClass('border-blue-500', 'text-blue-600');
    expect(calculatorTab.closest('button')).toHaveClass('border-transparent', 'text-gray-500');
    
    // Click calculator tab
    fireEvent.click(calculatorTab);
    
    // Calculator tab should now be active
    expect(calculatorTab.closest('button')).toHaveClass('border-blue-500', 'text-blue-600');
    expect(guideTab.closest('button')).toHaveClass('border-transparent', 'text-gray-500');
  });
});