import 'package:flutter/material.dart';
import './transaction.dart';

void main() {
  runApp(Modulo4());
}

class Modulo4 extends StatelessWidget {
  final List<Transaction> transactions = [
    Transaction(
      id: '1',
      title: 'New Shoes',
      amount: 69.99,
      date: DateTime.now(),
    ),
    Transaction(
      id: '2',
      title: 'Groceries',
      amount: 12.80,
      date: DateTime.now(),
    )
  ];

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        home: Scaffold(
      appBar: AppBar(
        title: Text('Flutter App'),
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            width: double.infinity,
            child: Card(
              color: Colors.blue,
              child: Text(
                  'Coluna, com alinhamentos.. children eh conteiner com card '),
              elevation: 5,
            ),
          ),
          Column(
            children: [
              ...transactions.map((trx) {
                return Card(
                  child: Text(trx.title),
                );
              }).toList(),
            ],
          )
        ],
      ),
    ));
  }
}
