import 'package:flutter/material.dart';

class Answer extends StatelessWidget {
  //estou passando a callback agora..
  final Function callback;
  final String answerText;

  Answer(this.callback, this.answerText);

  @override
  Widget build(BuildContext context) {
    return Container(
        width: double.infinity,
        child: ElevatedButton(
          style: ButtonStyle(
              backgroundColor: MaterialStateProperty.all(Colors.blue),
              foregroundColor: MaterialStateProperty.all(Colors.white)),
          onPressed: () {
            print('Resposta escolhida ');
            this.callback();
          },
          child: Text(answerText),
        ));
  }
}
