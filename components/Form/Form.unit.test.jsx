import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import validations from './validations';
import Form from './Form';

const onValidSubmitCallback = jest.fn();
const onSubmitCallback = jest.fn();
const mockEvent = { preventDefault: jest.fn() };

const FormWithoutValidations = () => (
  <Form onValidSubmit={onValidSubmitCallback} onSubmit={onSubmitCallback}>
    <Form.Input name="name" label="Name" />
  </Form>
);

const FormWithValidations = () => (
  <Form onValidSubmit={onValidSubmitCallback} onSubmit={onSubmitCallback}>
    <Form.Input name="required" label="required" validate={validations.REQUIRED} />
    <Form.Input name="cpf" label="CPF" validate={validations.CPF} />
    <Form.Input name="cep" label="CEP" validate={validations.CEP} />
    <Form.Input name="birthday" label="Birthday" validate={validations.DATE} />
    <Form.Input name="email" label="E-mail" validate={validations.EMAIL} />
    <Form.Input name="address" label="Address" validate={validations.MINLENGTH} minLength="8" />
    <Form.Input name="country" label="Country" validate={validations.MAXLENGTH} maxLength="3" />
    <Form.Submit />
  </Form>
);

beforeEach(() => {
  onValidSubmitCallback.mockClear();
  onSubmitCallback.mockClear();
});

describe('Form component ', () => {
  it('should match the snapshot', () => {
    expect(renderer.create(FormWithValidations()).toJSON()).toMatchSnapshot();
  });

  describe('Without validations', () => {
    it('Should call "onValidSubmit" and "onSubmit" callback on a valid submit', () => {
      const wrapper = shallow(FormWithoutValidations());
      wrapper.simulate('submit', mockEvent);

      expect(onValidSubmitCallback).toHaveBeenCalled();
      expect(onSubmitCallback).toHaveBeenCalled();
    });
  });

  describe('With validations', () => {
    it('Shouldn\'t call "onValidSubmit" and "onSubmit" callback on a invalid submit', () => {
      const wrapper = shallow(FormWithValidations());
      wrapper.simulate('submit', mockEvent);

      expect(onValidSubmitCallback).not.toHaveBeenCalled();
      expect(onSubmitCallback).toHaveBeenCalled();
    });

    it('Should validate fields', () => {
      const execTest = ({
        invalid,
        valid,
        validationName,
        errorMsg,
      }) => {
        const wrapper = shallow(FormWithValidations());
        const getField = () => wrapper.find({ validate: validations[validationName] });

        if (invalid) {
          const initalField = getField();
          initalField.simulate(
            'change',
            { target: { name: initalField.prop('name') } },
            { value: invalid },
          );
        }

        wrapper.simulate('submit', mockEvent);

        const beforeChange = getField();
        expect(beforeChange.prop('error')).toBe(errorMsg);

        beforeChange.simulate(
          'change',
          { target: { name: beforeChange.prop('name') } },
          { value: valid },
        );

        const afterChange = getField();
        expect(afterChange.prop('error')).toBe('');
      };

      const validationTests = [
        {
          validationName: 'REQUIRED',
          errorMsg: 'Campo obrigatório',
          valid: 'foo',
        },
        {
          validationName: 'CPF',
          errorMsg: 'CPF inválido',
          valid: '321.970.213-97',
          invalid: '123.456.212-34',
        },
        {
          validationName: 'CEP',
          errorMsg: 'CEP inválido',
          valid: '02354128',
        },
        {
          validationName: 'DATE',
          errorMsg: 'Data inválida',
          valid: '20/11/1981',
          invalid: '30/02/1950',
        },
        {
          validationName: 'EMAIL',
          errorMsg: 'E-mail inválido',
          valid: 'foo@baz.com',
          invalid: 'foo@baz',
        },
        {
          validationName: 'MAXLENGTH',
          errorMsg: 'Maximo de 3 caracteres excedido',
          valid: '123',
          invalid: '123456789',
        },
        {
          validationName: 'MINLENGTH',
          errorMsg: 'Mínimo de 8 caracteres requerido',
          valid: '12345678',
          invalid: '12345',
        },
      ];

      validationTests.forEach(params => execTest(params));
    });

    it('Should exec validations in diferent formats', () => {
      const form = (
        <Form onValidSubmit={onValidSubmitCallback} onSubmit={onSubmitCallback}>
          <Form.Input
            name="name"
            label="Name"
            minLength="8"
            validate={[
              validations.REQUIRED,
              {
                validate: validations.MINLENGTH,
                error: 'Valor mínimo de caracteres não alcançado',
              },
            ]}
          />
        </Form>
      );

      const wrapper = shallow(form);
      wrapper.simulate('submit', mockEvent);

      expect(onSubmitCallback).toHaveBeenCalled();

      const input = wrapper.find(Form.Input);

      input.simulate(
        'change',
        { target: { name: input.prop('name') } },
        { value: 'Some value' },
      );

      wrapper.simulate('submit', mockEvent);

      expect(onValidSubmitCallback).toHaveBeenCalled();
    });
  });
});
