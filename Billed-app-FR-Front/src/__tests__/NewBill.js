/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import store from "../__mocks__/store";


// jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  // on mocke la navigation
  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname });
  };
  // initialisation du parcours employé
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    })
  );
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })
    test("Then the form page should be rendered", async () => {
      // waiting for the form appears
      await waitFor(() => screen.getByTestId("form-new-bill"));
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();
    })
    test("Then the 9 inputs should be rendered properly", () => {
      // testing all 9 inputs to be rendered
      const type = screen.getByTestId("expense-type");
      expect(type).toBeTruthy()
			const name = screen.getByTestId("expense-name");
      expect(name).toBeTruthy()
			const date = screen.getByTestId("datepicker");
      expect(date).toBeTruthy()
			const amount = screen.getByTestId("amount");
      expect(amount).toBeTruthy()
			const vat = screen.getByTestId("vat");
      expect(vat).toBeTruthy()
			const pct = screen.getByTestId("pct");
      expect(pct).toBeTruthy()
			const commentary = screen.getByTestId("commentary");
      expect(commentary).toBeTruthy()
			const file = screen.getByTestId("file");
      expect(file).toBeTruthy()
			const submitBtn = document.querySelector("#btn-send-bill");
      expect(submitBtn).toBeTruthy()
    })
    test("Then mail icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId("icon-mail"))
      const mailIcon = screen.getByTestId("icon-mail")
      expect(mailIcon).toBeTruthy();
      expect(mailIcon).toHaveClass("active-icon")
    })

  })
  describe("When a file is upload as 'Justificatif'", () => {
    test("Then the handleChange function should be called", () => {
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: store,
        localStorage: window.localStorage
      })

      const newDocBtn = screen.getByTestId("file");
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      newDocBtn.addEventListener("click", handleChangeFile);
      userEvent.click(newDocBtn);

      expect(handleChangeFile).toHaveBeenCalled();
    })
    describe("When the format is wrong", () => {
      test("Then an error message should be displayed", () => {
        document.body.innerHTML = NewBillUI();

        const newBill = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage
        })

        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));


        const file = screen.getByTestId("file");
        const blob = new Blob(["wrongExtensionFile.pdf"]);
        file.addEventListener("change", handleChangeFile);

        const fileBlob = new File([blob], "wrongExtensionFile.pdf", {type: "application/pdf"});
        userEvent.upload(file, fileBlob)

        expect(handleChangeFile).toHaveBeenCalled();
        expect(file.files[0].name).toBe("wrongExtensionFile.pdf");

        const errorMessage = screen.getByTestId("errorMessage");
        console.log(errorMessage);
        expect(errorMessage.classList.length).toBe(0)
        expect(errorMessage).not.toHaveClass("hidden")
      })
    })
    describe("When the format is OK", () => {
      test("Then an error message should not be displayed", () => {
        document.body.innerHTML = NewBillUI();

        const newBill = new NewBill({
          document,
          onNavigate,
          store: store,
          localStorage
        })

        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

        const file = screen.getByTestId("file");
        const blob = new Blob(["ExtensionFile.jpg"]);

        const fileBlob = new File([blob], "ExtensionFile.jpg", {type: "image/jpg"});

        file.addEventListener("change", handleChangeFile);
        userEvent.upload(file, fileBlob)


        console.log(file);
        expect(handleChangeFile).toHaveBeenCalled();
        console.log(file.value);

        expect(file.files[0].name).toBe("ExtensionFile.jpg");
        expect(file.files.length).toBe(1);
      })
    })
    describe("When the user choose a correct file to upload", () => {
      test("Then the file input should show the name", () => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        document.body.innerHTML = NewBillUI();
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store: store,
          localStorage
        })

        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

        const file = screen.getByTestId("file");
        file.addEventListener("change", handleChangeFile);
        fireEvent.change(file, {
          target: {
            files: [new File(["file.png"], "file.png", { type: "image/png" })]
          }
        })
        expect(handleChangeFile).toHaveBeenCalled();
        expect(file.files[0].name).toBe("file.png");
      })
    })
    describe("When all inputs are correctly filled", () => {
      describe("When The new bill is submited", () => {
        test("The user should be redirected to the Bills page", async () => {
          document.body.innerHTML = NewBillUI();
          const newBill = new NewBill({
            document,
            onNavigate,
            store: store,
            localStorage: window.localStorage
          })
          newBill.fileName = 'facturefreemobile.jpg'

          const billForm = screen.getByTestId("form-new-bill");
          const handleSubmit = jest.fn((e) => handleSubmit(e))
          billForm.addEventListener("click", handleSubmit);
          fireEvent.submit(billForm);

          await waitFor(() => screen.getByText("Mes notes de frais") )

          const billsTitle = screen.getByText("Mes notes de frais");
          expect(billsTitle).toBeTruthy();
        })
      })
    })
    describe('When an input is not properly filled', () => {
      test('Then the user should stay on the new Bill page', async () => {
        document.body.innerHTML = NewBillUI();
        const newBill = new NewBill({
          document,
          onNavigate,
          store: store,
          localStorage: window.localStorage
        })

        const inputFile = screen.getByTestId("file");
        expect(inputFile.value).toBe("");

        const form = screen.getByTestId("form-new-bill");
        expect(form).toBeTruthy();
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);

        expect(form).toBeTruthy();
      })
    })
  })
})

// Test POST

describe("Given I am connected as an employee", () => {
  describe("When I submit the new bill with all inputs correctly filled", () => {
    test("It should create a new bill", async () => {

      const createBill = jest.fn(store.bills().create);
      const { fileUrl, key } = await createBill();

      expect(fileUrl).toBe("https://localhost:3456/images/test.jpg");
      expect(key).toBe("1234");
    })
    test("Then the bill is added to API POST", async () => {
      document.body.innerHTML = NewBillUI();

      const bill = {
        type: "Transports",
        name: "Test API Post",
        amount: 120,
        date: "2023-08-10",
        vat: "10",
        pct: 10,
        commentary: "commentaries",
        fileUrl: "testBill.png",
        fileName: "testBill",
        status: 'pending'
      };
      const type = screen.getByTestId("expense-type");
      fireEvent.change(type, { target: { value: bill.type } });
      expect(type.value).toBe(bill.type);

			const name = screen.getByTestId("expense-name");
      fireEvent.change(name, { target: { value: bill.name } });
      expect(name.value).toBe(bill.name);

			const date = screen.getByTestId("datepicker");
      fireEvent.change(date, { target: { value: bill.date } });
      expect(date.value).toBe(bill.date);

			const amount = screen.getByTestId("amount");
      fireEvent.change(amount, { target: { value: bill.amount } });
      expect(parseInt(amount.value)).toBe(parseInt(bill.amount));

			const vat = screen.getByTestId("vat");
      fireEvent.change(vat, { target: { value: bill.vat } });
      expect(parseInt(vat.value)).toBe(parseInt(bill.vat));

			const pct = screen.getByTestId("pct");
      fireEvent.change(pct, { target: { value: bill.pct } });
      expect(parseInt(pct.value)).toBe(parseInt(bill.pct));

			const commentary = screen.getByTestId("commentary");
      fireEvent.change(commentary, { target: { value: bill.commentary } });
      expect(commentary.value).toBe(bill.commentary);

      const form = screen.getByTestId("form-new-bill");
      const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      const newBill = new NewBill({
        document,
        onNavigate,
        store: store,
        localStorage: window.localStorage
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      newBill.updateBill = jest.fn();
      form.addEventListener("change", handleChangeFile);

      const file = screen.getByTestId("file");
      fireEvent.change(file, { target: { files: [ new File([bill.fileName], bill.fileUrl, { type: "image/png" }) ] } });
      expect(file.files[0].name).toBe(bill.fileUrl);
      expect(file.files[0].type).toBe("image/png");

      const handleSubmit = jest.fn(newBill.handleSubmit);
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleChangeFile).toHaveBeenCalled();
      expect(newBill.updateBill).toHaveBeenCalled();
      expect(handleSubmit).toHaveBeenCalled();
    });
  })
  describe("When an error occurs on API", () => {
    test("post bills to API fails with 404 message error", async () => {
      jest.spyOn(store, "bills");
      store.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      document.body.innerHTML = BillsUI({ error: "Erreur 404"})
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("post bills to API fails with 500 message error", async () => {
      jest.spyOn(store, "bills");
      store.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
        document.body.innerHTML = BillsUI({ error: "Erreur 500"})
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
    })
  })
})
