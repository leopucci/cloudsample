import 'package:flutter/material.dart';
import 'package:modulo2testepratico/text_output.dart';

class TextControl extends StatefulWidget {
  @override
  _TextControlState createState() => _TextControlState();
}

class _TextControlState extends State<TextControl> {
  String textoNovo = 'Texto a ser trocado';

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text(textoNovo),
      Center(
          child: Container(
              width: double.infinity,
              child: ElevatedButton(
                style: ButtonStyle(
                    backgroundColor: MaterialStateProperty.all(Colors.blue),
                    foregroundColor: MaterialStateProperty.all(Colors.white)),
                onPressed: () {
                  setState(() {
                    textoNovo = 'FOI TROCADO!';
                  });
                  print('Resposta escolhida ');
                },
                child: Text_Output("Trocar texto"),
              ))),
    ]);
  }
}
