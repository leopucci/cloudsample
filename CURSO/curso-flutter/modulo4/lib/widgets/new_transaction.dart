import 'package:flutter/material.dart';

class NewTransaction extends StatefulWidget {
  final Function addTx;
  NewTransaction(this.addTx);

  @override
  _NewTransactionState createState() => _NewTransactionState();
}

class _NewTransactionState extends State<NewTransaction> {
  final titleController = TextEditingController();

  final amountController = TextEditingController();

  void submidData() {
    final enteredTitle = titleController.text;
    final enteredAmount = double.parse(amountController.text);
    if (enteredTitle.isEmpty || enteredAmount <= 0) {
      return;
    }

    widget.addTx(enteredTitle, enteredAmount);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 10,
      child: Container(
        padding: EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            TextField(
              decoration: InputDecoration(labelText: 'Title'),
              onChanged: (value) {
                //     titleInput = value;
              },
              controller: titleController,
            ),
            TextField(
              decoration: InputDecoration(labelText: 'Amount'),
              //  onChanged: (value) => amountInput = value,
              controller: amountController,
              keyboardType: TextInputType.number,
              onSubmitted: (text) => submidData(),
            ),
            // ignore: deprecated_member_use
            FlatButton(
                onPressed: () {
                  //AutoOrientation.landscapeAutoMode();
                  submidData();
                  print(amountController.text);
                  print(titleController.text);
                  //      print(titleInput);
                  //      print(amountInput);
                },
                textColor: Colors.purple,
                child: Text('Add Transaction'))
          ],
        ),
      ),
    );
  }
}
